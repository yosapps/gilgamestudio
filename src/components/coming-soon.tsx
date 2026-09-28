import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Sparkles } from 'lucide-react';
export function ComingSoon({ kind = 'games' }: { kind?: 'games' | 'journal' }) {
  const games = kind === 'games';
  return (
    <div className={`coming-soon ${games ? '' : 'journal-empty'}`}>
      {games && (
        <div className="coming-art">
          <Image
            src="/logo.png"
            alt="Gilgame studioのクリスタルロゴ"
            fill
            sizes="(max-width: 760px) 70vw, 350px"
          />
        </div>
      )}
      <div className="coming-copy">
        <p className="eyebrow">
          <Sparkles size={16} />
          {games
            ? 'NEXT ADVENTURE / IN THE MAKING'
            : 'THE FIRST PAGE IS STILL AHEAD'}
        </p>
        <h3>{games ? '次の冒険を、準備中。' : '開発ノートは、これから。'}</h3>
        <p>
          {games
            ? 'まだ小さなアイデアを、少しずつ遊べる形に。作品をお披露目できる日まで、ギルガメと一緒にお待ちください。'
            : 'ひらめいたこと、試したこと、ちょっとした発見。ゲームづくりの道のりを、この場所に綴っていきます。'}
        </p>
        <Link className="text-link" href={games ? '/about' : '/games'}>
          {games ? 'ギルガメとスタジオについて' : 'ゲームの制作状況を見る'}
          <ArrowUpRight size={18} />
        </Link>
      </div>
    </div>
  );
}
