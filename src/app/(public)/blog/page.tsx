import { getPosts } from '@/lib/data';
import { PostCard } from '@/components/cards';
import { ComingSoon } from '@/components/coming-soon';
import Link from 'next/link';
export const metadata = {
  title: 'Development Journal',
  description: 'ゲーム開発の舞台裏、技術ノート、制作の記録。',
};
export default async function Blog({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    tag?: string;
    page?: string;
  }>;
}) {
  const q = await searchParams;
  const all = await getPosts();
  const filtered = all.filter(
    (p) =>
      (!q.q ||
        `${p.title} ${p.excerpt}`.toLowerCase().includes(q.q.toLowerCase())) &&
      (!q.category || p.category === q.category) &&
      (!q.tag || p.tags.includes(q.tag)),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 6));
  const page = Math.min(pages, Math.max(1, Number(q.page) || 1));
  return (
    <div className="page-wrap">
      <div className="page-intro">
        <p className="eyebrow">NOTES FROM THE WORKSHOP</p>
        <h1>
          Journal<span className="violet">.</span>
        </h1>
        <p>ひらめきも、寄り道も。ゲームづくりの小さな足あと。</p>
      </div>
      <form className="filter-bar">
        <label className="search-field">
          キーワード
          <input name="q" placeholder="記事を検索…" defaultValue={q.q} />
        </label>
        <label>
          カテゴリ
          <select name="category" defaultValue={q.category || ''}>
            <option value="">すべて</option>
            {[...new Set(all.map((p) => p.category))].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          タグ
          <select name="tag" defaultValue={q.tag || ''}>
            <option value="">すべて</option>
            {[...new Set(all.flatMap((p) => p.tags))].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <button className="button button-outline">検索</button>
      </form>
      {filtered.slice((page - 1) * 6, page * 6).map((p, i) => (
        <PostCard post={p} index={(page - 1) * 6 + i} key={p.id} />
      ))}
      {!all.length ? (
        <ComingSoon kind="journal" />
      ) : (
        !filtered.length && (
          <p className="empty-state">
            記事が見つかりませんでした。検索条件を変更してください。
          </p>
        )
      )}
      <nav className="pagination" aria-label="ページネーション">
        {Array.from({ length: pages }, (_, i) => (
          <Link
            aria-current={page === i + 1 ? 'page' : undefined}
            className="button button-outline"
            href={`/blog?${new URLSearchParams({ q: q.q || '', category: q.category || '', tag: q.tag || '', page: String(i + 1) })}`}
            key={i}
          >
            {i + 1}
          </Link>
        ))}
      </nav>
    </div>
  );
}
