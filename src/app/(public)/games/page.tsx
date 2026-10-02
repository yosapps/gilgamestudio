import { GilgameHunt } from '@/components/gilgame-hunt';
import { getTranslator } from '@/lib/locale-server';
import { getGames } from '@/lib/data';
import { GameCard } from '@/components/cards';
import { ComingSoon } from '@/components/coming-soon';
export async function generateMetadata() {
  const t = await getTranslator();
  return {
    title: 'Games',
    description: t('Gilgame studioがつくる、小さな発見ときらめく冒険。'),
  };
}
export default async function Games({
  searchParams,
}: {
  searchParams: Promise<{ genre?: string; status?: string }>;
}) {
  const t = await getTranslator();
  const q = await searchParams;
  const all = await getGames();
  const games = all.filter(
    (g) =>
      (!q.genre || (g.source_genre || g.genre) === q.genre) &&
      (!q.status || g.development_status === q.status),
  );
  return (
    <div className="page-wrap">
      <div className="page-intro">
        <p className="eyebrow">THE WORLDS WE CREATE</p>
        <h1>
          Games<span className="violet">.</span>
        </h1>
        <p>{t('ひとつのアイデアから、夢中になれる冒険へ。')}</p>
      </div>
      <form className="filter-bar">
        <label>
          {t('ジャンル')}
          <select name="genre" defaultValue={q.genre || ''}>
            <option value="">{t('すべて')}</option>
            {[
              ...new Map(
                all.map((g) => [g.source_genre || g.genre, g.genre]),
              ).entries(),
            ].map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t('開発状況')}
          <select name="status" defaultValue={q.status || ''}>
            <option value="">{t('すべて')}</option>
            {[...new Set(all.map((g) => g.development_status))].map((v) => (
              <option key={v} value={v}>
                {t(v)}
              </option>
            ))}
          </select>
        </label>
        <button className="button button-outline">{t('絞り込む')}</button>
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
          <p className="empty-state">
            {t('条件に一致するゲームはありません。')}
          </p>
        )
      )}
      <GilgameHunt id="games" />
    </div>
  );
}
