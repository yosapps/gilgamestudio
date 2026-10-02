import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/supabase';
import { ContentEditor } from '@/components/content-editor';
import type { Post, Game } from '@/lib/types';
import { z } from 'zod';
export default async function Edit({
  params,
}: {
  params: Promise<{ kind: string; id: string }>;
}) {
  const { kind, id } = await params;
  if ((kind !== 'posts' && kind !== 'games') || !z.uuid().safeParse(id).success)
    notFound();
  const { db, user } = await requireAdmin();
  const { data, error } = await db
    .from(kind)
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error('取得に失敗しました');
  if (!data) notFound();
  const { data: translation, error: translationError } = await db
    .from(kind === 'posts' ? 'post_translations' : 'game_translations')
    .select('*')
    .eq(kind === 'posts' ? 'post_id' : 'game_id', id)
    .maybeSingle();
  const missingTable =
    translationError && ['PGRST205', '42P01'].includes(translationError.code);
  if (translationError && !missingTable)
    throw new Error('英語版の取得に失敗しました');
  const { data: games, error: gameError } = await db
    .from('games')
    .select('id,title')
    .order('title');
  if (gameError) throw new Error('ゲーム一覧を取得できませんでした');
  return (
    <>
      <div className="admin-heading">
        <h1>{kind === 'posts' ? '記事を編集' : 'ゲームを編集'}</h1>
      </div>
      <ContentEditor
        kind={kind}
        games={games || []}
        draftScope={user.id}
        initial={data as Post | Game}
        translation={translation || undefined}
        translationsReady={!missingTable}
      />
    </>
  );
}
