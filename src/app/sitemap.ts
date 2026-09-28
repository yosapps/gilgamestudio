import { getGames, getPosts, siteUrl } from '@/lib/data';
import type { MetadataRoute } from 'next';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [games, posts] = await Promise.all([getGames(), getPosts()]);
  const base = siteUrl();
  return [
    ...['', '/games', '/blog', '/about', '/contact'].map((path) => ({
      url: base + path,
    })),
    ...games.map((g) => ({
      url: `${base}/games/${g.slug}`,
      lastModified: g.updated_at,
    })),
    ...posts.map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: p.updated_at,
    })),
  ];
}
