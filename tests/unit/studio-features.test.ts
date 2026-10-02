import { describe, it, expect } from 'vitest';
import {
  localePath,
  alternates,
  primaryAction,
  steamCampaignUrl,
  translationNeedsReview,
  rssDocument,
} from '@/lib/features';
import { parseDraft, draftLifetime } from '@/lib/drafts';
import { parseDiscoveries } from '@/lib/discoveries';
import { gameSchema, postSchema } from '@/lib/validation';
import { demoGames, demoPosts } from '@/lib/demo';
import type { PostTranslation } from '@/lib/types';
describe('言語URL', () => {
  it('検索条件とフラグメントを保ち、管理URLと外部URLは書き換えない', () => {
    expect(localePath('/en/blog?q=a#top', 'ja')).toBe('/blog?q=a#top');
    expect(localePath('/blog?q=a#top', 'en')).toBe('/en/blog?q=a#top');
    expect(localePath('/', 'en')).toBe('/en');
    expect(localePath('/admin/posts', 'en')).toBe('/admin/posts');
    expect(localePath('//external.example/path', 'en')).toBe(
      '//external.example/path',
    );
  });
  it('未翻訳の英語ページは日本語原文をcanonicalにする', () => {
    expect(alternates('/games/sample', 'en', false).canonical).toBe(
      '/games/sample',
    );
    expect(
      alternates('/games/sample', 'en', false).languages,
    ).not.toHaveProperty('en');
    expect(alternates('/games/sample', 'en').languages.en).toBe(
      '/en/games/sample',
    );
  });
});
describe('ゲームの主要ボタン', () => {
  const game = {
    ...demoGames[0],
    external_links: [
      { label: 'Steam', url: 'https://store.steampowered.com/app/123456/' },
    ],
  };
  it('開発中のSteam作品はウィッシュリスト、公開済みは購入に誘導する', () => {
    expect(primaryAction(game)?.label).toContain('ウィッシュリスト');
    expect(
      primaryAction({ ...game, development_status: 'リリース済み' })?.label,
    ).toBe('購入する');
  });
  it('指定した体験版を優先し、noneは表示しない', () => {
    expect(
      primaryAction({
        ...game,
        primary_action: 'demo',
        primary_url: 'https://example.com/demo',
      }),
    ).toEqual({ label: '体験版を遊ぶ', url: 'https://example.com/demo' });
    expect(primaryAction({ ...game, primary_action: 'none' })).toBeNull();
    expect(primaryAction({ ...game, external_links: [] })).toBeNull();
  });
  it('Steamの既存キャンペーンを上書きしない', () => {
    const url = new URL(
      steamCampaignUrl(
        game.external_links[0].url + '?utm_source=event',
        game.slug,
      ),
    );
    expect(url.searchParams.get('utm_source')).toBe('event');
    expect(url.searchParams.get('utm_medium')).toBe('website');
    expect(url.searchParams.get('utm_campaign')).toBe(game.slug);
    expect(steamCampaignUrl('javascript:alert(1)', game.slug)).toBe('');
    expect(steamCampaignUrl('https://example.com/store', game.slug)).toBe(
      'https://example.com/store',
    );
  });
});
describe('翻訳の確認状態', () => {
  const translation: PostTranslation = {
    post_id: demoPosts[0].id,
    locale: 'en',
    title: 'English',
    excerpt: '',
    content: { type: 'doc' },
    category: '',
    tags: [],
    seo_title: '',
    seo_description: '',
    is_published: true,
    source_revision: 2,
  };
  it('公開設定と独立して原文の更新を検知する', () => {
    expect(
      translationNeedsReview(
        { ...demoPosts[0], source_revision: 2 },
        translation,
      ),
    ).toBe(false);
    expect(
      translationNeedsReview(
        { ...demoPosts[0], source_revision: 3 },
        translation,
      ),
    ).toBe(true);
    expect(translationNeedsReview(demoPosts[0])).toBe(false);
  });
});
describe('ブラウザ下書き', () => {
  const now = Date.now();
  const key = 'user-a:post:ja';
  const draft = {
    version: 1,
    key,
    savedAt: now,
    baseUpdatedAt: 'revision-1',
    data: {
      fields: { title: 'Private draft' },
      content: { type: 'doc', content: [] },
    },
  };
  it('別ユーザーの下書き、期限切れ、壊れた本文を復元しない', () => {
    expect(parseDraft(JSON.stringify(draft), key, now)?.data.fields.title).toBe(
      'Private draft',
    );
    expect(parseDraft(JSON.stringify(draft), 'user-b:post:ja', now)).toBeNull();
    expect(
      parseDraft(JSON.stringify(draft), key, now + draftLifetime + 1),
    ).toBeNull();
    expect(parseDraft('{broken', key)).toBeNull();
    expect(
      parseDraft(
        JSON.stringify({
          ...draft,
          data: { fields: { title: 'x' }, content: { type: 'script' } },
        }),
        key,
        now,
      ),
    ).toBeNull();
  });
});
describe('RSSと図鑑', () => {
  it('本文をXMLエスケープし、下書きと未来記事を除外する', () => {
    const post = {
      ...demoPosts[0],
      title: 'A & <B>',
      excerpt: 'A "quote"',
      published_at: '2020-01-01T00:00:00Z',
      status: 'published' as const,
    };
    const xml = rssDocument(
      [
        post,
        { ...post, slug: 'secret', status: 'draft' },
        { ...post, slug: 'future', published_at: '2099-01-01T00:00:00Z' },
      ],
      'https://example.com',
      'en',
      'Studio',
      'News',
    );
    expect(xml).toContain('A &amp; &lt;B&gt;');
    expect(xml).toContain('/en/blog/');
    expect(xml).not.toContain('/secret');
    expect(xml).not.toContain('/future');
    expect(xml.match(/<item>/g)).toHaveLength(1);
  });
  it('図鑑に未知のIDや重複を入れない', () => {
    expect(parseDiscoveries('["home","home","invalid",12]')).toEqual(['home']);
    expect(parseDiscoveries('{broken')).toEqual([]);
  });
});
describe('追加項目の入力検証', () => {
  it('作品への不正な参照と危険な主要URLを拒否する', () => {
    expect(
      postSchema.safeParse({ ...demoPosts[0], game_id: 'invalid' }).success,
    ).toBe(false);
    expect(
      gameSchema.safeParse({
        ...demoGames[0],
        primary_action: 'demo',
        primary_url: 'http://example.com',
      }).success,
    ).toBe(false);
    expect(
      gameSchema.safeParse({ ...demoGames[0], primary_action: 'unsupported' })
        .success,
    ).toBe(false);
  });
});
