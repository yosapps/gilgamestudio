import { getGames } from '@/lib/data';
import { GameCard } from '@/components/cards';
import { ComingSoon } from '@/components/coming-soon';
export const metadata = {
  title: 'Games',
  description: 'Gilgame studioがつくる、小さな発見ときらめく冒険。',
};
export default async function Games({
  searchParams,
}: {
  searchParams: Promise<{ genre?: string; status?: string }>;
}) {
  const q = await searchParams;
  const all = await getGames();
  const games = all.filter(
    (g) =>
      (!q.genre || g.genre === q.genre) &&
      (!q.status || g.development_status === q.status),
  );
  return (
    <div className="page-wrap">
      <div className="page-intro">
        <p className="eyebrow">THE WORLDS WE CREATE</p>
        <h1>
          Games<span className="violet">.</span>
        </h1>
        <p>ひとつのアイデアから、夢中になれる冒険へ。</p>
      </div>
      <form className="filter-bar">
        <label>
          ジャンル
          <select name="genre" defaultValue={q.genre || ''}>
            <option value="">すべて</option>
            {[...new Set(all.map((g) => g.genre))].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <label>
          開発状況
          <select name="status" defaultValue={q.status || ''}>
            <option value="">すべて</option>
            {[...new Set(all.map((g) => g.development_status))].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <button className="button button-outline">絞り込む</button>
        <span className="muted">{games.length} PROJECTS</span>
      </form>
      <div className="games-grid">
        {games.map((g, i) => (
          <GameCard key={g.id} game={g} index={i} />
        ))}
      </div>
      {!all.length ? (
        <ComingSoon />
      ) : (
        !games.length && (
          <p className="empty-state">条件に一致するゲームはありません。</p>
        )
      )}
    </div>
  );
}
