import type { Game, Post, PostTranslation, GameTranslation } from './types';
import type { Locale } from './locale';
export function localePath(value: string, locale: Locale): string {
  if (
    !value.startsWith('/') ||
    value.startsWith('//') ||
    /^\/(?:admin|api|login)(?:\/|$)/.test(value)
  )
    return value;
  const stripped = value.replace(/^\/(?:en|ja)(?=\/|[?#]|$)/, '') || '/';
  return locale === 'en'
    ? '/en' + (stripped === '/' ? '' : stripped)
    : stripped;
}
export function alternates(value: string, locale: Locale, english = true) {
  return {
    canonical: localePath(value, english ? locale : 'ja'),
    languages: {
      ja: localePath(value, 'ja'),
      ...(english ? { en: localePath(value, 'en') } : {}),
      'x-default': localePath(value, 'ja'),
    },
  };
}
export function translationNeedsReview(
  parent: Post | Game,
  translation?: PostTranslation | GameTranslation,
) {
  return (
    !!translation &&
    (translation.source_revision ?? 0) !== (parent.source_revision ?? 1)
  );
}
export function steamCampaignUrl(value: string, slug: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return '';
    if (
      url.hostname === 'store.steampowered.com' &&
      /^\/app\/\d+(?:\/|$)/.test(url.pathname)
    ) {
      for (const [key, val] of Object.entries({
        utm_source: 'gilgame_studio',
        utm_medium: 'website',
        utm_campaign: slug,
      }))
        if (!url.searchParams.has(key)) url.searchParams.set(key, val);
    }
    return url.toString();
  } catch {
    return '';
  }
}
export function primaryAction(game: Game) {
  if (game.primary_action === 'none') return null;
  const chosen =
    game.primary_url ||
    game.external_links.find((l) => /Steam|itch|demo|体験版/i.test(l.label))
      ?.url;
  if (!chosen) return null;
  const steam = (() => {
    try {
      const url = new URL(chosen);
      return (
        url.hostname === 'store.steampowered.com' &&
        /^\/app\/\d+/.test(url.pathname)
      );
    } catch {
      return false;
    }
  })();
  const demo = game.external_links.some(
    (link) => link.url === chosen && /demo|体験版/i.test(link.label),
  );
  const action =
    game.primary_action && game.primary_action !== 'auto'
      ? game.primary_action
      : game.development_status === 'リリース済み'
        ? 'buy'
        : demo
          ? 'demo'
          : steam
            ? 'wishlist'
            : 'details';
  const labels = {
    details: 'ストアページを見る',
    wishlist: 'Steamでウィッシュリストに追加',
    demo: '体験版を遊ぶ',
    buy: '購入する',
  };
  const url = steamCampaignUrl(chosen, game.slug);
  return url ? { label: labels[action], url } : null;
}
export function escapeXml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (c) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&apos;',
      })[c]!,
  );
}
export function rssDocument(
  posts: Post[],
  base: string,
  locale: Locale,
  name: string,
  description: string,
) {
  const feed = base + localePath('/feed.xml', locale);
  return (
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>' +
    '<title>' +
    escapeXml(name) +
    '</title><link>' +
    escapeXml(base + localePath('/blog', locale)) +
    '</link><description>' +
    escapeXml(description) +
    '</description><language>' +
    locale +
    '</language><atom:link href="' +
    escapeXml(feed) +
    '" rel="self" type="application/rss+xml"/>' +
    posts
      .filter(
        (post) =>
          ['published', 'scheduled'].includes(post.status) &&
          !!post.published_at &&
          new Date(post.published_at).getTime() <= Date.now(),
      )
      .map((post) => {
        const url = base + localePath('/blog/' + post.slug, locale);
        return (
          '<item><title>' +
          escapeXml(post.title) +
          '</title><link>' +
          escapeXml(url) +
          '</link><guid isPermaLink="true">' +
          escapeXml(url) +
          '</guid><description>' +
          escapeXml(post.excerpt) +
          '</description><pubDate>' +
          new Date(post.published_at!).toUTCString() +
          '</pubDate></item>'
        );
      })
      .join('') +
    '</channel></rss>'
  );
}
