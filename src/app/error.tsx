'use client';
import { useTranslator } from '@/components/language-provider';

export default function ErrorPage({ reset }: { reset: () => void }) {
  const t = useTranslator();
  return (
    <main id="main" className="page-wrap empty-state">
      <h1>{t('読み込みに失敗しました')}</h1>
      <p>{t('時間をおいてもう一度お試しください。')}</p>
      <button className="button button-primary" onClick={reset}>
        {t('再読み込み')}
      </button>
    </main>
  );
}
