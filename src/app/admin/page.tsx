import { requireAdmin } from '@/lib/supabase';
import Link from 'next/link';
export default async function Dashboard() {
  const { db } = await requireAdmin();
  const results = await Promise.all(
    ['posts', 'games', 'media'].map((table) =>
      db.from(table).select('*', { count: 'exact', head: true }),
    ),
  );
  if (results.some((r) => r.error)) throw new Error('集計に失敗しました');
  return (
    <>
      <div className="admin-heading">
        <div>
          <p className="eyebrow">STUDIO OVERVIEW</p>
          <h1>創作の続きを、ここから。</h1>
        </div>
      </div>
      <div className="stats-grid">
        {results.map((r, i) => (
          <Link
            href={['/admin/posts', '/admin/games', '/admin/media'][i]}
            key={i}
            className="stat"
          >
            <span>{['ブログ記事', 'ゲーム作品', '画像アセット'][i]}</span>
            <strong>{r.count || 0}</strong>
          </Link>
        ))}
      </div>
      <section className="admin-panel">
        <h2>次のアイデアを形にする</h2>
        <p className="muted">
          下書きは公開サイトに表示されません。予約投稿は設定した日時から自動的に公開対象になります。
        </p>
        <div className="hero-actions">
          <Link className="button button-primary" href="/admin/posts/new">
            記事を書く ↗
          </Link>
          <Link className="button button-outline" href="/admin/games/new">
            ゲームを追加
          </Link>
        </div>
      </section>
      <p className="muted">
        公開ページの更新は最大60秒で反映されます。日時入力はこのブラウザのタイムゾーンです。
      </p>
    </>
  );
}
