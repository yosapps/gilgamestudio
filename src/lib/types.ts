export type PublishState = 'draft' | 'published' | 'scheduled' | 'archived';
export type RichNode = {
  type: string;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
  content?: RichNode[];
};
export type Post = {
  source_category?: string;
  source_tags?: string[];
  content_locale?: 'ja' | 'en';
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: RichNode;
  cover_url: string;
  category: string;
  tags: string[];
  status: PublishState;
  published_at: string | null;
  seo_title: string;
  seo_description: string;
  created_at: string;
  updated_at: string;
};
export type Game = {
  source_genre?: string;
  source_tags?: string[];
  content_locale?: 'ja' | 'en';
  id: string;
  title: string;
  slug: string;
  description: string;
  body: string;
  cover_url: string;
  genre: string;
  development_status: string;
  status: PublishState;
  sort_order: number;
  release_date: string | null;
  tags: string[];
  technologies: string[];
  screenshots: string[];
  trailer_url: string;
  external_links: { label: string; url: string }[];
  created_at: string;
  updated_at: string;
};
export type Settings = {
  id: number;
  site_name: string;
  description: string;
  profile: string;
  og_image: string;
  social_links: { label: string; url: string }[];
};
export type PostTranslation = Pick<
  Post,
  | 'title'
  | 'excerpt'
  | 'content'
  | 'category'
  | 'tags'
  | 'seo_title'
  | 'seo_description'
> & {
  post_id: string;
  locale: 'en';
  is_published: boolean;
};
export type GameTranslation = Pick<
  Game,
  'title' | 'description' | 'body' | 'genre' | 'tags' | 'external_links'
> & {
  game_id: string;
  locale: 'en';
  is_published: boolean;
};
