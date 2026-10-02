import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowLeft, Gamepad2 } from 'lucide-react';
import Link from '@/components/localized-link';
import { GilgameRunner } from '@/components/gilgame-runner';
import { GilgameStars } from '@/components/gilgame-stars';
import { alternates } from '@/lib/features';
import { getLocale, getTranslator } from '@/lib/locale-server';
import { getMinigame } from '@/lib/minigames';
import styles from '../minigames.module.css';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const game = getMinigame(slug);
  if (!game) notFound();
  const t = await getTranslator();
  return {
    title: t(game.title),
    description: t(game.description),
    alternates: alternates('/minigames/' + game.slug, await getLocale()),
  };
}

export default async function MinigameDetail({ params }: Props) {
  const { slug } = await params;
  const game = getMinigame(slug);
  if (!game) notFound();
  const t = await getTranslator();
  return (
    <article className={'page-wrap ' + styles.detail}>
      <Link href="/minigames" className={'text-link ' + styles.backLink}>
        <ArrowLeft size={16} aria-hidden="true" />
        {t('ミニゲーム一覧へ')}
      </Link>
      <div className={styles.detailIntro}>
        <p className="eyebrow">
          <Gamepad2 size={16} aria-hidden="true" />
          {t(game.category)} · {t(game.duration)}
        </p>
        <h1>{t(game.title)}</h1>
        <p>{t(game.description)}</p>
      </div>
      {game.slug === 'gilgame-stars' ? (
        <GilgameStars />
      ) : (
        <GilgameRunner variant="minigames" />
      )}
      <section className={styles.guide} aria-labelledby="minigames-guide-title">
        <h2 id="minigames-guide-title">{t('遊び方')}</h2>
        <div className={styles.tips}>
          {game.tips.map((tip, index) => (
            <div className={styles.tip} key={tip.title}>
              <span className={styles.icon} aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div>
                <h3>{t(tip.title)}</h3>
                <p>{t(tip.text)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}
