import { minigames } from '@/lib/minigames';
import { getGames, getPosts, siteUrl } from '@/lib/data';
import { localePath } from '@/lib/features';
import type { MetadataRoute } from 'next';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [games, posts, englishGames, englishPosts] = await Promise.all([
    getGames('ja'),
    getPosts('ja'),
    getGames('en'),
    getPosts('en'),
  ]);
  const base = siteUrl();
  const entry = (value: string, lastModified?: string, english = true) => ({
    url: base + value,
    ...(lastModified ? { lastModified } : {}),
    alternates: {
      languages: {
        ja: base + value,
        ...(english ? { en: base + localePath(value, 'en') } : {}),
      },
    },
  });
  return [
    ...[
      '',
      '/games',
      '/minigames',
      ...minigames.map((game) => '/minigames/' + game.slug),
      '/blog',
      '/about',
      '/contact',
      '/press',
      '/discover',
    ].flatMap((value) => [
      entry(value),
      { ...entry(value), url: base + localePath(value || '/', 'en') },
    ]),
    ...games.flatMap((g) => {
      const en = englishGames.find((e) => e.id === g.id);
      const value = '/games/' + g.slug;
      const item = entry(value, g.updated_at, en?.content_locale === 'en');
      return en?.content_locale === 'en'
        ? [item, { ...item, url: base + localePath(value, 'en') }]
        : [item];
    }),
    ...posts.flatMap((p) => {
      const en = englishPosts.find((e) => e.id === p.id);
      const value = '/blog/' + p.slug;
      const item = entry(value, p.updated_at, en?.content_locale === 'en');
      return en?.content_locale === 'en'
        ? [item, { ...item, url: base + localePath(value, 'en') }]
        : [item];
    }),
  ];
}
