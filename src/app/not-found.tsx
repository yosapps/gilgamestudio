import { getTranslator } from '@/lib/locale-server';
import Link from 'next/link';
export default async function NotFound() {
  const t = await getTranslator();
  return (
    <main id="main" className="page-wrap empty-state">
      <p className="eyebrow">404 / UNEXPLORED TERRITORY</p>
      <h1>{t('ここは、まだ未知の世界。')}</h1>
      <p>{t('ページが見つからないか、公開されていません。')}</p>
      <Link className="button button-primary" href="/">
        {t('ホームへ戻る')}
      </Link>
    </main>
  );
}
