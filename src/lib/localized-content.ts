import type { Game, Post, GameTranslation, PostTranslation } from './types';

export function localizePost(post: Post, translation?: PostTranslation): Post {
  if (!translation?.is_published) return { ...post, content_locale: 'ja' };
  return {
    ...post,
    title: translation.title,
    excerpt: translation.excerpt,
    content: translation.content,
    category: translation.category || post.category,
    tags: translation.tags.length ? translation.tags : post.tags,
    seo_title: translation.seo_title,
    seo_description: translation.seo_description,
    source_category: post.category,
    source_tags: post.tags,
    content_locale: 'en',
  };
}

export function localizeGame(game: Game, translation?: GameTranslation): Game {
  if (!translation?.is_published) return { ...game, content_locale: 'ja' };
  return {
    ...game,
    title: translation.title,
    description: translation.description,
    body: translation.body,
    genre: translation.genre || game.genre,
    tags: translation.tags.length ? translation.tags : game.tags,
    external_links: translation.external_links.length
      ? translation.external_links
      : game.external_links,
    source_genre: game.genre,
    source_tags: game.tags,
    content_locale: 'en',
  };
}
