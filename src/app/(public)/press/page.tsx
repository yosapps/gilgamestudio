import { getGames, getSettings } from '@/lib/data';
import { getLocale, getTranslator } from '@/lib/locale-server';
import Link from '@/components/localized-link';
import Image from 'next/image';
import { studioBrand } from '@/lib/brand';
export const metadata = { title: 'Press Kit' };
export default async function Press() {
  const locale = await getLocale();
  const t = await getTranslator();
  const [settings, games] = await Promise.all([getSettings(), getGames()]);
  const guidelines =
    locale === 'en'
      ? settings.press_guidelines_en || settings.press_guidelines
      : settings.press_guidelines;
  return (
    <div className="page-wrap press-page">
      <div className="page-intro">
        <p className="eyebrow">FOR PRESS & CREATORS</p>
        <h1>
          Press Kit<span className="violet">.</span>
        </h1>
        <p>{t('紹介や取材に使えるスタジオ情報と作品素材。')}</p>
      </div>
      <section className="press-section">
        <h2>{settings.site_name}</h2>
        <p>{t(settings.description)}</p>
        <p>{t(settings.profile)}</p>
        <a
          className="button button-outline"
          href={'/api/press-kit?locale=' + locale}
          download
        >
          {t('紹介文をダウンロード')} ↓
        </a>
        <a
          className="text-link"
          href={studioBrand.x.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t('取材のお問い合わせ')} ↗
        </a>
      </section>
      <section className="press-section">
        <h2>{t('ロゴとキャラクター')}</h2>
        <div className="press-assets">
          {[
            { url: '/logo.png', label: t('スタジオロゴ') },
            { url: '/gilgame.png', label: t('ギルガメ') },
          ].map((asset) => (
            <article key={asset.url}>
              <Image
                src={asset.url}
                alt={asset.label}
                width={300}
                height={300}
              />
              <h3>{asset.label}</h3>
              <a className="button button-outline" href={asset.url} download>
                {t('画像をダウンロード')} ↓
              </a>
            </article>
          ))}
        </div>
      </section>
      <section className="press-section">
        <h2>{t('素材・配信ガイドライン')}</h2>
        <p className="guidelines">
          {guidelines ||
            t(
              '素材の利用・ゲームの配信については、公式Xへお問い合わせください。',
            )}
        </p>
        <Link href="/contact" className="text-link">
          {t('お問い合わせ')} →
        </Link>
      </section>
      {games.map((game) => (
        <section
          className="press-section"
          id={'game-' + game.slug}
          key={game.id}
        >
          <h2>{game.title}</h2>
          <p>{game.description}</p>
          <dl className="press-facts">
            <dt>{t('ジャンル')}</dt>
            <dd>{game.genre}</dd>
            <dt>{t('開発状況')}</dt>
            <dd>{t(game.development_status)}</dd>
            <dt>{t('リリース日')}</dt>
            <dd>{game.release_date || t('未定')}</dd>
          </dl>
          <Link className="text-link" href={'/games/' + game.slug}>
            {t('作品ページを見る')} →
          </Link>
          <div className="press-assets">
            {[
              ...new Set([game.cover_url, ...game.screenshots].filter(Boolean)),
            ].map((url, index) => (
              <article key={url + index}>
                <Image
                  src={url}
                  alt={game.title + ' ' + (index + 1)}
                  width={600}
                  height={350}
                />
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link"
                >
                  {t('画像を開く')} ↗
                </a>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
