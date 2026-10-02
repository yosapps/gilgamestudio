import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { unstable_cache } from 'next/cache';
import { demoGames, demoPosts, demoSettings } from './demo';
import { configured } from './supabase';
import type {
  Game,
  Post,
  Settings,
  GameTranslation,
  PostTranslation,
} from './types';
import type { Locale } from './locale';
import { getLocale } from './locale-server';
import { localizeGame, localizePost } from './localized-content';
// Anonymous client only: never cache an administrator session or a draft.
const publicDb = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
const getBaseGames = unstable_cache(
  async (): Promise<Game[]> => {
    if (!configured()) return demoGames;
    const { data, error } = await publicDb()
      .from('games')
      .select('*')
      .eq('status', 'published')
      .order('sort_order');
    if (error) throw new Error('ゲームの取得に失敗しました');
    return data;
  },
  ['public-games'],
  { revalidate: 60, tags: ['games'] },
);
const getBasePosts = unstable_cache(
  async (): Promise<Post[]> => {
    if (!configured()) return demoPosts;
    const { data, error } = await publicDb()
      .from('posts')
      .select('*')
      .in('status', ['published', 'scheduled'])
      .lte('published_at', new Date().toISOString())
      .order('published_at', { ascending: false });
    if (error) throw new Error('記事の取得に失敗しました');
    return data;
  },
  ['public-posts'],
  { revalidate: 60, tags: ['posts'] },
);
export const getSettings = unstable_cache(
  async (): Promise<Settings> => {
    if (!configured()) return demoSettings;
    const { data, error } = await publicDb()
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .single();
    if (error) throw new Error('サイト設定の取得に失敗しました');
    return data;
  },
  ['public-settings'],
  { revalidate: 60, tags: ['settings'] },
);
export const siteUrl = () =>
  (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(
    /\/+$/,
    '',
  );

const getPostTranslations = unstable_cache(
  async (): Promise<PostTranslation[]> => {
    if (!configured()) return [];
    const { data, error } = await publicDb()
      .from('post_translations')
      .select('*')
      .eq('locale', 'en')
      .eq('is_published', true);
    // Deploying code before the migration must not break the existing public site.
    if (error && ['PGRST205', '42P01'].includes(error.code)) return [];
    if (error) throw new Error('英語記事の取得に失敗しました');
    return data;
  },
  ['public-post-translations'],
  { revalidate: 60, tags: ['posts'] },
);

const getGameTranslations = unstable_cache(
  async (): Promise<GameTranslation[]> => {
    if (!configured()) return [];
    const { data, error } = await publicDb()
      .from('game_translations')
      .select('*')
      .eq('locale', 'en')
      .eq('is_published', true);
    if (error && ['PGRST205', '42P01'].includes(error.code)) return [];
    if (error) throw new Error('英語ゲームの取得に失敗しました');
    return data;
  },
  ['public-game-translations'],
  { revalidate: 60, tags: ['games'] },
);

export async function getPosts(locale?: Locale): Promise<Post[]> {
  const selected = locale || (await getLocale());
  const posts = await getBasePosts();
  if (selected === 'ja') return posts;
  const translations = new Map(
    (await getPostTranslations()).map((item) => [item.post_id, item]),
  );
  return posts.map((post) => localizePost(post, translations.get(post.id)));
}

export async function getGames(locale?: Locale): Promise<Game[]> {
  const selected = locale || (await getLocale());
  const games = await getBaseGames();
  if (selected === 'ja') return games;
  const translations = new Map(
    (await getGameTranslations()).map((item) => [item.game_id, item]),
  );
  return games.map((game) => localizeGame(game, translations.get(game.id)));
}
