import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/supabase';
import { ContentForm } from '@/components/content-form';
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
  const { db } = await requireAdmin();
  const { data, error } = await db
    .from(kind)
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error('取得に失敗しました');
  if (!data) notFound();
  return (
    <>
      <div className="admin-heading">
        <h1>{kind === 'posts' ? '記事を編集' : 'ゲームを編集'}</h1>
      </div>
      <ContentForm kind={kind} initial={data as Post | Game} />
    </>
  );
}
