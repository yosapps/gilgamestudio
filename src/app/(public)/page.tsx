import { getTranslator } from '@/lib/locale-server';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowDown,
  Code2,
  Gem,
  Heart,
  Sparkles,
} from 'lucide-react';
import Image from 'next/image';
import { messages } from '@/lib/i18n';
import { ComingSoon } from '@/components/coming-soon';
import { getGames, getPosts, getSettings, siteUrl } from '@/lib/data';
import { SectionTitle, ContactCTA } from '@/components/shell';
import { HeroArt } from '@/components/hero-art';
import { GameCard, PostCard } from '@/components/cards';
import { Reveal } from '@/components/reveal';
import { OfficialX } from '@/components/official-x';
import { studioBrand } from '@/lib/brand';
export default async function Home() {
  const t = await getTranslator();
  const [games, posts, s] = await Promise.all([
    getGames(),
    getPosts(),
    getSettings(),
  ]);
  return (
    <>
      <section className="hero">
        <div className="hero-grid" />
        <div className="hero-copy">
          <p className="eyebrow">
            <Gem size={15} /> A LITTLE STUDIO, A WORLD OF WONDER
          </p>
          <h1>
            {t(messages.hero.headline)}
            <br />
            <span>{t(messages.hero.accent)}</span>
          </h1>
          <p className="hero-description">
            {t('見つける楽しさ。できたときのうれしさ。')}
            <br />
            {t('ギルガメと一緒に、心はずむ世界をつくっています。')}
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/games">
              {t('ゲームを探索する')}
              <ArrowUpRightIcon />
            </Link>
            <Link className="button button-ghost" href="/blog">
              {t('開発の舞台裏へ')}
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
        <HeroArt />
        <div className="hero-bottom">
          <span>SMALL STEPS. BIG CURIOSITY.</span>
          <a href="#selected">
            SCROLL TO EXPLORE <ArrowDown size={14} />
          </a>
          <span>MADE WITH A LITTLE MAGIC</span>
        </div>
      </section>
      <div className="ticker">
        <span>A LITTLE CURIOSITY</span>
        <i>✦</i>
        <span>A SPARK OF JOY</span>
        <i>✦</i>
        <span>YOUR NEXT ADVENTURE</span>
        <i>✦</i>
      </div>
      <section className="section" id="selected">
        <SectionTitle
          index="01"
          label="OUR LITTLE ADVENTURES"
          title={t('ワクワクを、遊べる形に。')}
          href="/games"
          linkText={t('すべてのゲーム')}
        />
        {!games.length ? (
          <ComingSoon />
        ) : (
          <div className="featured-games">
            {games.slice(0, 2).map((g, i) => (
              <Reveal key={g.id}>
                <GameCard game={g} index={i} />
              </Reveal>
            ))}
          </div>
        )}
      </section>
      <section className="character-section" aria-labelledby="meet-gilgame">
        <div className="character-portrait">
          <span className="character-orbit" />
          {/* 画像を真ん中に配置するためのコメント */}
          <Image
            src="/gilgame-sit.png"
            alt={t('水色のからだ、金色の甲羅、青いクリスタルが目印のギルガメ')}
            width={500}
            height={500}
            sizes="(max-width:760px) 85vw, 45vw"
            className="character-image"
          />
        </div>
        <div className="character-story">
          <p className="eyebrow">
            <Sparkles size={16} /> MEET YOUR LITTLE COMPANION
          </p>
          <h2 id="meet-gilgame">
            {t('こんにちは、')}
            <br />
            {t('ギルガメです。')}
          </h2>
          <p>
            {t('きらりと光るクリスタルと、')}
            <br />
            {t('笑顔が目印の、小さな相棒。')}
          </p>
          <p>
            {t('新しい世界への一歩は、いつだってドキドキ。')}
            <br />
            {t('その先にある発見を、一緒に楽しもう。')}
          </p>
          <div className="character-traits">
            <span>
              <Gem size={16} /> {t('きらめく好奇心')}
            </span>
            <span>
              <Heart size={16} /> {t('笑顔になる冒険')}
            </span>
          </div>
          <Link href="/about" className="text-link">
            {t('ギルガメとスタジオを知る')}
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
      <section className="section journal-section">
        <SectionTitle
          index="02"
          label="DEVELOPMENT JOURNAL"
          title={t('冒険の、その舞台裏。')}
          href="/blog"
          linkText={t('すべての記事')}
        />
        {!posts.length ? (
          <ComingSoon kind="journal" />
        ) : (
          posts.slice(0, 3).map((p, i) => (
            <Reveal key={p.id}>
              <PostCard post={p} index={i} />
            </Reveal>
          ))
        )}
      </section>
      <section className="section about-preview">
        <div>
          <p className="eyebrow">
            <span>03</span> THE HEART OF THE STUDIO
          </p>
          <h2>
            {t('小さくつくって、')}
            <br />
            {t('大きくときめく。')}
          </h2>
          <Link href="/about" className="text-link">
            {t('開発者について')}
            <ArrowRight size={18} />
          </Link>
        </div>
        <div>
          <p className="about-text">{t(s.profile)}</p>
          <div className="tool-list">
            <span>
              <Code2 /> {t('まずは、つくって試してみる')}
            </span>
            <span>
              <Gem /> {t('小さな発見を、大切にする')}
            </span>
            <span>
              <Heart /> {t('また会いたくなる世界をつくる')}
            </span>
          </div>
          <p className="muted">Unreal Engine · Godot · Blender · TypeScript</p>
        </div>
      </section>
      <OfficialX />
      <ContactCTA />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: s.site_name,
            url: siteUrl(),
            description: t(s.description),
            sameAs: [studioBrand.x.url],
          }).replace(/</g, '\\u003c'),
        }}
      />
    </>
  );
}
function ArrowUpRightIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M5 19 19 5M5 5h14v14" />
    </svg>
  );
}
