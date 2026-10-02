import { GilgameHunt } from '@/components/gilgame-hunt';
import { getTranslator } from '@/lib/locale-server';
import { getPosts, getGames } from '@/lib/data';
import { PostCard } from '@/components/cards';
import { ComingSoon } from '@/components/coming-soon';
import Link from '@/components/localized-link';
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
    game?: string;
    q?: string;
    category?: string;
    tag?: string;
    page?: string;
  }>;
}) {
  const t = await getTranslator();
  const q = await searchParams;
  const all = await getPosts();
  const games = await getGames();
  const selectedGame = games.find((game) => game.slug === q.game);
  const filtered = all.filter(
    (p) =>
      (!q.game || (!!selectedGame && p.game_id === selectedGame.id)) &&
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
        <label>
          {t('作品')}
          <select name="game" defaultValue={q.game || ''}>
            <option value="">{t('すべて')}</option>
            {games.map((game) => (
              <option key={game.id} value={game.slug}>
                {game.title}
              </option>
            ))}
          </select>
        </label>
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
      <div className="journal-subscribe">
        <h2>{t('冒険のつづきを受け取る')}</h2>
        <p>{t('RSSで新しい記事をチェックできます。')}</p>
        <Link
          href="/feed.xml"
          className="button button-outline"
          prefetch={false}
        >
          {t('RSSを購読する')} ↗
        </Link>
      </div>
      <nav className="pagination" aria-label={t('ページネーション')}>
        {Array.from({ length: pages }, (_, i) => (
          <Link
            aria-current={page === i + 1 ? 'page' : undefined}
            className="button button-outline"
            href={`/blog?${new URLSearchParams({ game: q.game || '', q: q.q || '', category: q.category || '', tag: q.tag || '', page: String(i + 1) })}`}
            key={i}
          >
            {i + 1}
          </Link>
        ))}
      </nav>
      <GilgameHunt id="journal" />
    </div>
  );
}
