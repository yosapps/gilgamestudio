import { getLocale, getTranslator } from '@/lib/locale-server';
import { localePath } from '@/lib/features';
import { GilgameRunner } from '@/components/gilgame-runner';
export default async function NotFound() {
  const t = await getTranslator();
  const locale = await getLocale();
  return (
    <main id="main" className="page-wrap not-found-page">
      <div className="not-found-intro">
        <p className="eyebrow">404 / UNEXPLORED TERRITORY</p>
        <h1>{t('ここは、まだ未知の世界。')}</h1>
        <p>{t('ページが見つからないか、公開されていません。')}</p>
        <p className="muted">
          {t('戻る前に、ギルガメと少し寄り道しませんか？')}
        </p>
      </div>
      <GilgameRunner />
      <div className="not-found-links">
        <a className="button button-primary" href={localePath('/', locale)}>
          {t('ホームへ戻る')}
        </a>
        <a className="text-link" href={localePath('/minigames', locale)}>
          {t('ミニゲームで遊ぶ')} →
        </a>
        <a className="text-link" href={localePath('/games', locale)}>
          {t('すべてのゲーム')} →
        </a>
      </div>
    </main>
  );
}
