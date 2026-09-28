import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/supabase';
import { ContentForm } from '@/components/content-form';
export default async function New({
  params,
}: {
  params: Promise<{ kind: string }>;
}) {
  await requireAdmin();
  const { kind } = await params;
  if (kind !== 'posts' && kind !== 'games') notFound();
  return (
    <>
      <div className="admin-heading">
        <h1>{kind === 'posts' ? '新しい記事を書く' : 'ゲームを追加'}</h1>
      </div>
      <ContentForm kind={kind} />
    </>
  );
}
