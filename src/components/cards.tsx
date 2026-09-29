import { getTranslator } from '@/lib/locale-server';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { Game, Post } from '@/lib/types';
export async function GameCard({
  game,
  index = 0,
}: {
  game: Game;
  index?: number;
}) {
  const t = await getTranslator();
  return (
    <Link href={`/games/${game.slug}`} className="game-card">
      <div className="game-image">
        {game.cover_url && (
          <Image
            src={game.cover_url}
            alt={`${t(game.title)} ${t('コンセプトアート')}`}
            fill
            sizes="(max-width: 760px) 100vw, 65vw"
          />
        )}
        <span className="image-number">0{index + 1} / SELECTED WORK</span>
        <span className="status">
          <i />
          {t(game.development_status)}
        </span>
        <span className="game-arrow">
          <ArrowUpRight />
        </span>
      </div>
      <div className="game-info">
        <div>
          <p className="eyebrow">{t(game.genre)}</p>
          <h3>{t(game.title)}</h3>
        </div>
        <p>{t(game.description)}</p>
      </div>
    </Link>
  );
}
export async function PostCard({
  post,
  index = 0,
}: {
  post: Post;
  index?: number;
}) {
  const t = await getTranslator();
  return (
    <Link className="post-row" href={`/blog/${post.slug}`}>
      <span className="post-number">0{index + 1}</span>
      <div className="post-thumb">
        {post.cover_url && (
          <Image src={post.cover_url} alt="" fill sizes="160px" />
        )}
      </div>
      <div className="post-summary">
        <div className="post-meta">
          <span>{t(post.category)}</span>
          <time dateTime={post.published_at || ''}>
            {post.published_at?.slice(0, 10).replaceAll('-', '.')}
          </time>
        </div>
        <h3>{t(post.title)}</h3>
        <p>{t(post.excerpt)}</p>
      </div>
      <ArrowUpRight className="post-arrow" size={24} />
    </Link>
  );
}
