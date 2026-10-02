import { getPosts, getSettings, siteUrl } from '@/lib/data';
import { getLocale, getTranslator } from '@/lib/locale-server';
import { rssDocument } from '@/lib/features';
export async function GET() {
  const locale = await getLocale();
  const t = await getTranslator();
  const [posts, settings] = await Promise.all([
    getPosts(locale),
    getSettings(),
  ]);
  return new Response(
    rssDocument(
      posts
        .filter((p) => locale === 'ja' || p.content_locale === 'en')
        .slice(0, 30),
      siteUrl(),
      locale,
      settings.site_name + ' Journal',
      t(settings.description),
    ),
    {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=60',
        'X-Content-Type-Options': 'nosniff',
      },
    },
  );
}
