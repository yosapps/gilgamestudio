import { getTranslator } from '@/lib/locale-server';
import { DiscoveryCollection } from '@/components/gilgame-hunt';
export const metadata = { title: 'Gilgame Discoveries' };
export default async function Discover() {
  const t = await getTranslator();
  return (
    <div className="page-wrap">
      <div className="page-intro">
        <p className="eyebrow">LITTLE DISCOVERIES</p>
        <h1>{t('ギルガメの図鑑')}</h1>
        <p>{t('サイトに隠れたギルガメを探して、小さな発見を集めよう。')}</p>
      </div>
      <DiscoveryCollection />
    </div>
  );
}
