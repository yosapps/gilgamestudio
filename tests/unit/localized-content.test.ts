import { describe, it, expect } from 'vitest';
import { localizeGame, localizePost } from '../../src/lib/localized-content';
import { demoGames, demoPosts } from '../../src/lib/demo';
import type { GameTranslation, PostTranslation } from '../../src/lib/types';
import {
  gameTranslationSchema,
  postTranslationSchema,
} from '../../src/lib/validation';

const post = demoPosts[0];
const game = demoGames[0];
const enPost: PostTranslation = {
  post_id: post.id,
  locale: 'en',
  title: 'English title',
  excerpt: 'English summary',
  content: {
    type: 'doc',
    content: [
      { type: 'paragraph', content: [{ type: 'text', text: 'English body' }] },
    ],
  },
  category: 'News',
  tags: ['English tag'],
  seo_title: 'SEO title',
  seo_description: 'SEO description',
  is_published: true,
};
const enGame: GameTranslation = {
  game_id: game.id,
  locale: 'en',
  title: 'English game',
  description: 'Summary',
  body: 'English world',
  genre: 'Adventure',
  tags: [],
  external_links: [],
  is_published: true,
};
describe('published CMS translations', () => {
  it('uses translated copy and preserves shared URLs, dates and media', () => {
    const result = localizePost(post, enPost);
    expect(result.title).toBe(enPost.title);
    expect(result.content).toEqual(enPost.content);
    expect(result.slug).toBe(post.slug);
    expect(result.cover_url).toBe(post.cover_url);
    expect(result.published_at).toBe(post.published_at);
    expect(result.source_tags).toEqual(post.tags);
    expect(result.content_locale).toBe('en');
    expect(post.title).not.toBe(enPost.title);
  });
  it('does not expose a draft English translation', () => {
    expect(localizePost(post, { ...enPost, is_published: false }).title).toBe(
      post.title,
    );
    expect(localizeGame(game, { ...enGame, is_published: false }).body).toBe(
      game.body,
    );
    expect(localizePost(post).title).toBe(post.title);
  });
  it('shares game status and uses original external links when English links are empty', () => {
    const result = localizeGame(game, enGame);
    expect(result.body).toBe(enGame.body);
    expect(result.development_status).toBe(game.development_status);
    expect(result.external_links).toEqual(game.external_links);
    expect(result.source_genre).toBe(game.genre);
  });
  it('rejects unsafe rich content, links and unsupported languages', () => {
    expect(postTranslationSchema.safeParse(enPost).success).toBe(true);
    expect(gameTranslationSchema.safeParse(enGame).success).toBe(true);
    expect(
      postTranslationSchema.safeParse({
        ...enPost,
        content: { type: 'doc', content: [{ type: 'script', text: 'bad' }] },
      }).success,
    ).toBe(false);
    expect(
      gameTranslationSchema.safeParse({
        ...enGame,
        external_links: [{ label: 'Bad', url: 'javascript:alert(1)' }],
      }).success,
    ).toBe(false);
    expect(
      postTranslationSchema.safeParse({ ...enPost, locale: 'fr' }).success,
    ).toBe(false);
  });
});
