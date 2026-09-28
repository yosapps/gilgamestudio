import { requireAdmin } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ContentForm } from '@/components/content-form';
import { MediaManager } from '@/components/media-manager';
import type { Settings } from '@/lib/types';
export default async function Manage({
  params,
}: {
  params: Promise<{ kind: string }>;
}) {
  const { kind } = await params;
  if (!['posts', 'games', 'media', 'settings'].includes(kind)) notFound();
  const { db } = await requireAdmin();
  if (kind === 'settings') {
    const { data, error } = await db
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .single();
    if (error) throw new Error('設定の取得に失敗しました');
    return (
      <>
        <div className="admin-heading">
          <h1>サイト設定</h1>
        </div>
        <ContentForm kind="settings" initial={data as Settings} />
      </>
    );
  }
  if (kind === 'media') {
    const { data, error } = await db
      .from('media')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error('画像の取得に失敗しました');
    return (
      <>
        <div className="admin-heading">
          <h1>メディアライブラリ</h1>
        </div>
        <MediaManager initial={data} />
      </>
    );
  }
  const { data, error } = await db
    .from(kind)
    .select('id,title,slug,status,updated_at')
    .order('updated_at', { ascending: false });
  if (error) throw new Error('データの取得に失敗しました');
  const labels: Record<string, string> = {
    draft: '下書き',
    published: '公開',
    scheduled: '予約投稿',
    archived: 'アーカイブ',
  };
  return (
    <>
      <div className="admin-heading">
        <div>
          <h1>{kind === 'posts' ? 'ブログ' : 'ゲーム'}管理</h1>
          <p>{data.length}件のコンテンツ</p>
        </div>
        <Link className="button button-primary" href={`/admin/${kind}/new`}>
          新規作成 ＋
        </Link>
      </div>
      <div className="table-scroll">
        <table className="admin-table">
          <thead>
            <tr>
              <th>タイトル</th>
              <th>状態</th>
              <th>更新日</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id}>
                <td>
                  <Link href={`/admin/${kind}/${item.id}/edit`}>
                    {item.title}
                  </Link>
                  <div className="muted">/{item.slug}</div>
                </td>
                <td>{labels[item.status]}</td>
                <td>{item.updated_at.slice(0, 10)}</td>
                <td>
                  <Link href={`/admin/${kind}/${item.id}/edit`}>編集 ↗</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!data.length && (
          <p className="empty-state">
            コンテンツはまだありません。新規作成から始めましょう。
          </p>
        )}
      </div>
    </>
  );
}
