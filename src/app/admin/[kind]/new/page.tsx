import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/supabase';
import { ContentEditor } from '@/components/content-editor';
export default async function New({
  params,
}: {
  params: Promise<{ kind: string }>;
}) {
  const { db, user } = await requireAdmin();
  const { kind } = await params;
  if (kind !== 'posts' && kind !== 'games') notFound();
  const { data: games, error } = await db
    .from('games')
    .select('id,title')
    .order('title');
  if (error) throw new Error('ゲーム一覧を取得できませんでした');
  return (
    <>
      <div className="admin-heading">
        <h1>{kind === 'posts' ? '新しい記事を書く' : 'ゲームを追加'}</h1>
      </div>
      <ContentEditor kind={kind} games={games || []} draftScope={user.id} />
    </>
  );
}
