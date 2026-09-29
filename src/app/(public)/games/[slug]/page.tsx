import { getTranslator } from '@/lib/locale-server';
import { getGames, siteUrl } from '@/lib/data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { youtubeId } from '@/lib/validation';
import type { Metadata } from 'next';
import { studioBrand } from '@/lib/brand';
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const g = (await getGames()).find((g) => g.slug === slug);
  if (!g) notFound();
  return {
    title: g.title,
    description: g.description,
    alternates: { canonical: `/games/${g.slug}` },
    openGraph: {
      title: g.title,
      description: g.description,
      images: g.cover_url ? [g.cover_url] : [],
    },
    twitter: {
      card: 'summary_large_image',
      site: studioBrand.x.handle,
      title: g.title,
      description: g.description,
      images: g.cover_url ? [g.cover_url] : [],
    },
  };
}
export default async function GameDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const t = await getTranslator();
  const { slug } = await params;
  const g = (await getGames()).find((g) => g.slug === slug);
  if (!g) notFound();
  const video = youtubeId(g.trailer_url);
  return (
    <article className="page-wrap">
      <Link className="text-link" href="/games">
        {t('← すべてのゲーム')}
      </Link>
      <div className="page-intro">
        <p className="eyebrow">
          {g.genre} / {t(g.development_status)}
        </p>
        <h1 className="game-title">{g.title}</h1>
        <p>{g.description}</p>
      </div>
      {g.cover_url && (
        <div className="detail-cover">
          <Image
            src={g.cover_url}
            alt={`${g.title} ${t('キービジュアル')}`}
            fill
            priority
            sizes="100vw"
          />
        </div>
      )}
      <div className="detail-columns">
        <div className="prose">
          <h2>{t('この世界について')}</h2>
          {t(g.body)
            .split('\n\n')
            .map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          <div className="tags">
            {g.tags.map((tag) => (
              <span key={tag}>{t(tag)}</span>
            ))}
          </div>
        </div>
        <aside className="game-spec">
          <p className="eyebrow">PROJECT DETAILS</p>
          <dl>
            <dt>{t('開発状況')}</dt>
            <dd>{t(g.development_status)}</dd>
            <dt>{t('リリース日')}</dt>
            <dd>{g.release_date || t('未定')}</dd>
            <dt>{t('使用技術')}</dt>
            <dd>{g.technologies.join(' / ')}</dd>
          </dl>
          {g.external_links.map((l) => (
            <a
              className="button button-outline"
              href={l.url}
              key={l.label}
              target="_blank"
              rel="noopener noreferrer"
            >
              {l.label} ↗
            </a>
          ))}
        </aside>
      </div>
      {video && (
        <section className="section">
          <h2>Trailer</h2>
          <iframe
            className="trailer"
            src={`https://www.youtube-nocookie.com/embed/${video}`}
            title={`${g.title} ${t('トレーラー')}`}
            allow="encrypted-media; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </section>
      )}
      {g.screenshots.length > 0 && (
        <section>
          <h2>Screenshots</h2>
          <div className="gallery">
            {g.screenshots.map((src, i) => (
              <a href={src} target="_blank" rel="noopener noreferrer" key={i}>
                <Image
                  src={src}
                  alt={`${g.title} ${t('スクリーンショット')} ${i + 1}`}
                  width={1200}
                  height={700}
                />
              </a>
            ))}
          </div>
        </section>
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'VideoGame',
            name: g.title,
            description: g.description,
            url: `${siteUrl()}/games/${g.slug}`,
            genre: g.genre,
          }).replace(/</g, '\\u003c'),
        }}
      />
    </article>
  );
}
