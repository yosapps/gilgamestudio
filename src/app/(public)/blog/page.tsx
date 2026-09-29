import { getTranslator } from '@/lib/locale-server';
import { getPosts } from '@/lib/data';
import { PostCard } from '@/components/cards';
import { ComingSoon } from '@/components/coming-soon';
import Link from 'next/link';
export async function generateMetadata() {
  const t = await getTranslator();
  return {
    title: 'Development Journal',
    description: t('ゲーム開発の舞台裏、技術ノート、制作の記録。'),
  };
}
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
  const t = await getTranslator();
  const q = await searchParams;
  const all = await getPosts();
  const filtered = all.filter(
    (p) =>
      (!q.q ||
        `${p.title} ${p.excerpt} ${t(p.title)} ${t(p.excerpt)}`
          .toLowerCase()
          .includes(q.q.toLowerCase())) &&
      (!q.category || (p.source_category || p.category) === q.category) &&
      (!q.tag ||
        (p.source_tags || p.tags).includes(q.tag) ||
        p.tags.includes(q.tag)),
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
        <p>{t('ひらめきも、寄り道も。ゲームづくりの小さな足あと。')}</p>
      </div>
      <form className="filter-bar">
        <label className="search-field">
          {t('キーワード')}
          <input name="q" placeholder={t('記事を検索…')} defaultValue={q.q} />
        </label>
        <label>
          {t('カテゴリ')}
          <select name="category" defaultValue={q.category || ''}>
            <option value="">{t('すべて')}</option>
            {[
              ...new Map(
                all.map((p) => [p.source_category || p.category, p.category]),
              ).entries(),
            ].map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t('タグ')}
          <select name="tag" defaultValue={q.tag || ''}>
            <option value="">{t('すべて')}</option>
            {[
              ...new Map(
                all.flatMap((p) =>
                  p.tags.map(
                    (tag, index) =>
                      [p.source_tags?.[index] || tag, tag] as const,
                  ),
                ),
              ).entries(),
            ].map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <button className="button button-outline">{t('検索')}</button>
      </form>
      {filtered.slice((page - 1) * 6, page * 6).map((p, i) => (
        <PostCard post={p} index={(page - 1) * 6 + i} key={p.id} />
      ))}
      {!all.length ? (
        <ComingSoon kind="journal" />
      ) : (
        !filtered.length && (
          <p className="empty-state">
            {t('記事が見つかりませんでした。検索条件を変更してください。')}
          </p>
        )
      )}
      <nav className="pagination" aria-label={t('ページネーション')}>
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
