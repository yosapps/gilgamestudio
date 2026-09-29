import { getTranslator } from '@/lib/locale-server';
import { getSettings } from '@/lib/data';
import { ContactCTA } from '@/components/shell';
import Image from 'next/image';
import { Gem, Heart, Footprints } from 'lucide-react';
export const metadata = { title: 'About' };
export default async function About() {
  const t = await getTranslator();
  const s = await getSettings();
  return (
    <>
      <div className="page-wrap about-page">
        <div className="page-intro">
          <p className="eyebrow">THE PERSON BEHIND THE PIXELS</p>
          <h1>
            {t('小さな相棒と、')}
            <br />
            {t('大きなワクワクを。')}
          </h1>
        </div>
        <div className="detail-columns">
          <div className="about-symbol">
            <Image
              src="/gilgame.png"
              alt={t('Gilgame studioのメインキャラクター、ギルガメ')}
              width={520}
              height={520}
              priority
            />
            <p>{s.site_name}</p>
            <span>SMALL STEPS. SPARKLING ADVENTURES.</span>
          </div>
          <div className="prose">
            <h2>{t('スタジオから、こんにちは。')}</h2>
            <p>{t(s.profile)}</p>
            <h3>
              <Gem size={22} /> {t('ギルガメと、はじめの一歩。')}
            </h3>
            <p>
              {t(
                '水色のからだに金色の甲羅、額には青いクリスタル。ギルガメは、このスタジオのメインキャラクターです。親しみやすい笑顔と、きらめく好奇心を、ゲームづくりの原点にしています。',
              )}
            </p>
            <h3>
              <Heart size={22} /> {t('大切にしたい、遊びの手触り。')}
            </h3>
            <p>
              {t(
                '新しい道を見つけた瞬間。少し工夫して、うまくできた瞬間。そんな小さな喜びが積み重なる、やさしくて夢中になれる体験を目指しています。',
              )}
            </p>
            <h3>
              <Footprints size={22} /> {t('一歩ずつ、かたちに。')}
            </h3>
            <p>
              {t(
                'Unreal Engine / Godot / Blender / Visual Studio Code。アイデアを試し、遊んで、少しずつ磨く。その制作過程も、開発ノートで届けていきます。',
              )}
            </p>
          </div>
        </div>
      </div>
      <ContactCTA />
    </>
  );
}
