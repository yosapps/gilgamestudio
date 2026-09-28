import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { unstable_cache } from 'next/cache';
import { demoGames, demoPosts, demoSettings } from './demo';
import { configured } from './supabase';
import type { Game, Post, Settings } from './types';
// Anonymous client only: never cache an administrator session or a draft.
const publicDb = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
export const getGames = unstable_cache(
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
export const getPosts = unstable_cache(
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
  process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
