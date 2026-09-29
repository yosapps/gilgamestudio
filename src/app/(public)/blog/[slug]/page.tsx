import { getTranslator } from '@/lib/locale-server';
import { getPosts, siteUrl } from '@/lib/data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { RichContent } from '@/components/rich-content';
import { PostCard } from '@/components/cards';
import type { Metadata } from 'next';
import { studioBrand } from '@/lib/brand';
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const t = await getTranslator();
  const { slug } = await params;
  const p = (await getPosts()).find((p) => p.slug === slug);
  if (!p) notFound();
  return {
    title: t(p.seo_title || p.title),
    description: t(p.seo_description || p.excerpt),
    alternates: { canonical: `/blog/${p.slug}` },
    openGraph: {
      type: 'article',
      title: t(p.title),
      description: t(p.excerpt),
      publishedTime: p.published_at || undefined,
      images: p.cover_url ? [p.cover_url] : [],
    },
    twitter: {
      card: 'summary_large_image',
      site: studioBrand.x.handle,
      title: t(p.title),
      description: t(p.excerpt),
      images: p.cover_url ? [p.cover_url] : [],
    },
  };
}
export default async function Article({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const t = await getTranslator();
  const { slug } = await params;
  const all = await getPosts();
  const p = all.find((p) => p.slug === slug);
  if (!p) notFound();
  const related = all
    .filter((x) => x.id !== p.id)
    .sort(
      (a, b) =>
        Number(b.category === p.category) - Number(a.category === p.category),
    )
    .slice(0, 2);
  return (
    <article className="page-wrap article-wrap">
      <Link href="/blog" className="text-link">
        ← Journal
      </Link>
      <header className="page-intro">
        <p className="eyebrow">
          {t(p.category)} <span> / </span>
          <time>{p.published_at?.slice(0, 10)}</time>
        </p>
        <h1>{t(p.title)}</h1>
        <p>{t(p.excerpt)}</p>
      </header>
      {p.cover_url && (
        <div className="detail-cover">
          <Image
            src={p.cover_url}
            alt={t(p.title)}
            fill
            priority
            sizes="100vw"
          />
        </div>
      )}
      <div className="prose article-body">
        <RichContent node={p.content} translate={t} />
        <div className="tags">
          {p.tags.map((tag) => (
            <Link href={`/blog?tag=${encodeURIComponent(tag)}`} key={tag}>
              #{t(tag)}
            </Link>
          ))}
        </div>
      </div>
      <section className="section">
        <p className="eyebrow">KEEP EXPLORING</p>
        <h2>{t('あわせて読む')}</h2>
        {related.map((x) => (
          <PostCard post={x} key={x.id} />
        ))}
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: t(p.title),
            datePublished: p.published_at,
            dateModified: p.updated_at,
            description: t(p.excerpt),
            url: `${siteUrl()}/blog/${p.slug}`,
          }).replace(/</g, '\\u003c'),
        }}
      />
    </article>
  );
}
