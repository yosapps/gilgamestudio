import { getTranslator } from '@/lib/locale-server';
import { ArrowUpRight } from 'lucide-react';
import { studioBrand } from '@/lib/brand';

export function XIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.64 7.584H.47l8.6-9.835L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
  );
}

export async function OfficialX() {
  const t = await getTranslator();
  return (
    <section className="official-x" aria-labelledby="official-x-title">
      <div className="official-x-mark">
        <XIcon />
      </div>
      <div className="official-x-copy">
        <p className="eyebrow">FOLLOW OUR LITTLE ADVENTURE</p>
        <h2 id="official-x-title">{t('小さな冒険のつづきは、Xで。')}</h2>
        <p>
          {t(
            'ゲームづくりの近況やお知らせを、公式アカウントからお届けします。',
          )}
        </p>
      </div>
      <a
        className="button button-primary"
        href={studioBrand.x.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${t('公式X')} ${studioBrand.x.handle} (${t('新しいタブで開きます')})`}
      >
        <span>
          {t('公式Xをチェック')}
          <small>{studioBrand.x.handle}</small>
        </span>
        <ArrowUpRight size={18} aria-hidden="true" />
      </a>
    </section>
  );
}
