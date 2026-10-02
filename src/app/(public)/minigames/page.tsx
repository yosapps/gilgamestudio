import type { Metadata } from 'next';
import Image from 'next/image';
import { ExternalLink, Gamepad2, Smartphone, Star } from 'lucide-react';
import Link from '@/components/localized-link';
import { getTranslator } from '@/lib/locale-server';
import { minigames } from '@/lib/minigames';
import styles from './minigames.module.css';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslator();
  return {
    title: 'Mini games',
    description: t('ギルガメが主人公のミニゲームを、ブラウザで気軽に遊ぼう。'),
  };
}

export default async function MinigamesPage() {
  const t = await getTranslator();
  return (
    <div className="page-wrap">
      <div className="page-intro">
        <p className="eyebrow">
          <Gamepad2 size={18} aria-hidden="true" /> A LITTLE PLAYTIME
        </p>
        <h1>
          Mini games<span className="violet">.</span>
        </h1>
        <p>{t('ギルガメと、気軽にひと遊び。')}</p>
      </div>
      <div className={styles.features}>
        <span>
          <Gamepad2 size={16} aria-hidden="true" />
          {t('ダウンロード不要')}
        </span>
        <span>
          <Smartphone size={16} aria-hidden="true" />
          {t('PC・スマートフォン対応')}
        </span>
      </div>
      <p className={styles.listNotice}>
        {t('遊びたいゲームを選ぶと、新しいタブで開きます。')}
      </p>
      <ul className={styles.gameList} aria-label={t('ミニゲーム一覧')}>
        {minigames.map((game) => (
          <li key={game.slug}>
            <Link
              href={'/minigames/' + game.slug}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.card}
            >
              <div
                className={
                  styles.preview +
                  ' ' +
                  (game.slug === 'gilgame-stars'
                    ? styles.starPreview
                    : styles.runPreview)
                }
                aria-hidden="true"
              >
                <span className={styles.previewLabel}>
                  {game.slug === 'gilgame-stars' ? 'STAR CATCH' : 'GILGAME RUN'}
                </span>
                {game.slug === 'gilgame-stars' ? (
                  <>
                    <Star className={styles.previewStar} size={46} />
                    <Star className={styles.smallStar} size={24} />
                  </>
                ) : (
                  <>
                    <span className={styles.crystal} />
                    <span className={styles.smallCrystal} />
                  </>
                )}
                <Image
                  src="/gilgame.png"
                  alt=""
                  width={230}
                  height={230}
                  className={styles.character}
                  sizes="230px"
                />
              </div>
              <div className={styles.cardBody}>
                <div className={styles.tags}>
                  <span>{t(game.category)}</span>
                  <span>{t(game.duration)}</span>
                  <span>{t(game.difficulty)}</span>
                </div>
                <h2>{t(game.title)}</h2>
                <p>{t(game.description)}</p>
                <span className={styles.cardAction}>
                  {t('遊ぶ')}
                  <ExternalLink size={17} aria-hidden="true" />
                  <span className={styles.newTab}>
                    {t('新しいタブで開きます')}
                  </span>
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
