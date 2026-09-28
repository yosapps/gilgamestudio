import { describe, it, expect } from 'vitest';
import {
  postSchema,
  gameSchema,
  settingsSchema,
  isPublicPost,
  validateUpload,
  imageUrl,
} from '../../src/lib/validation';
import { demoPosts, demoGames } from '../../src/lib/demo';
describe('公開と予約投稿', () => {
  const now = new Date('2026-09-24T10:00:00Z');
  it.each(['draft', 'archived'])('%s は公開しない', (status) =>
    expect(
      isPublicPost({ status, published_at: '2020-01-01T00:00:00Z' }, now),
    ).toBe(false),
  );
  it('未来の published / scheduled は公開しない', () => {
    for (const status of ['published', 'scheduled'])
      expect(
        isPublicPost({ status, published_at: '2026-09-25T00:00:00Z' }, now),
      ).toBe(false);
  });
  it('公開境界時刻から表示する', () =>
    expect(
      isPublicPost(
        { status: 'scheduled', published_at: now.toISOString() },
        now,
      ),
    ).toBe(true));
  it('公開日時がない公開記事を拒否する', () =>
    expect(
      postSchema.safeParse({ ...demoPosts[0], published_at: null }).success,
    ).toBe(false));
});
describe('入力と不正コンテンツ', () => {
  it('ブランド画像のみローカルのルートパスとして許可する', () => {
    for (const path of ['/gilgame.png', '/logo.png'])
      expect(imageUrl.safeParse(path).success).toBe(true);
    for (const path of [
      '/private.png',
      '/logo.png/../private.png',
      '/logo.svg',
    ])
      expect(imageUrl.safeParse(path).success).toBe(false);
  });
  it('記事・ゲーム・設定の正規データを許可する', () => {
    expect(postSchema.safeParse(demoPosts[0]).success).toBe(true);
    expect(gameSchema.safeParse(demoGames[0]).success).toBe(true);
    expect(
      settingsSchema.safeParse({
        site_name: 'Studio',
        description: '',
        profile: '',
        og_image: '',
        social_links: [],
      }).success,
    ).toBe(true);
  });
  it('スラッグ不正・重複区切りを拒否する', () => {
    for (const slug of ['../../admin', 'A B', 'a--b', '日本語'])
      expect(postSchema.safeParse({ ...demoPosts[0], slug }).success).toBe(
        false,
      );
  });
  it('未知の本文ノードと javascript リンクを拒否する', () => {
    for (const node of [
      { type: 'script', text: 'alert(1)' },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'x',
            marks: [{ type: 'link', attrs: { href: 'javascript:alert(1)' } }],
          },
        ],
      },
    ])
      expect(
        postSchema.safeParse({
          ...demoPosts[0],
          content: { type: 'doc', content: [node] },
        }).success,
      ).toBe(false);
  });
  it('外部画像・SVG・過大アップロードを拒否する', () => {
    expect(imageUrl.safeParse('https://evil.example/image.png').success).toBe(
      false,
    );
    expect(validateUpload('x.svg', 'image/svg+xml', 30)).toBe(false);
    expect(validateUpload('x.png', 'image/jpeg', 30)).toBe(false);
    expect(validateUpload('x.webp', 'image/webp', 4 * 1024 * 1024 + 1)).toBe(
      false,
    );
    expect(validateUpload('photo.JPG', 'image/jpeg', 1024)).toBe(true);
  });
  it('YouTube以外の埋め込みURLを拒否する', () =>
    expect(
      gameSchema.safeParse({
        ...demoGames[0],
        trailer_url: 'https://evil.example/embed',
      }).success,
    ).toBe(false));
});
