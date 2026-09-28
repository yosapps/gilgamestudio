import type { Game, Post, Settings } from './types';
import { studioBrand } from './brand';
const date = '2026-09-01T00:00:00Z';
export const demoSettings: Settings = {
  id: 1,
  site_name: studioBrand.name,
  description: studioBrand.description,
  profile: studioBrand.profile,
  og_image: studioBrand.ogImage,
  social_links: [],
};
export const demoGames: Game[] = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    title: 'ECHOES OF THE VOID',
    slug: 'echoes-of-the-void',
    description:
      '静寂の向こうに、まだ誰も知らない物語がある。失われた星の記憶をたどる、探索アドベンチャー。',
    body: '目を覚ましたのは、時が止まった観測所。あなたの足音だけが、遠い星の記憶を呼び起こす。\n\n重力を操り、忘れられた建築を読み解き、世界に残された小さな声を集めてください。戦うことよりも、立ち止まって見つめることを大切にした探索体験です。',
    cover_url: '/art/void.png',
    genre: '探索アドベンチャー',
    development_status: '開発中',
    status: 'published',
    sort_order: 0,
    release_date: null,
    tags: ['探索', 'SF', 'シングルプレイ'],
    technologies: ['Unreal Engine 5', 'Blender', 'C++'],
    screenshots: ['/art/void.png'],
    trailer_url: '',
    external_links: [],
    created_at: date,
    updated_at: date,
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    title: 'AFTERGLOW',
    slug: 'afterglow',
    description:
      '世界の終わりに、小さな灯りを。植物と機械が共に生きる庭で、明日を育てる。',
    body: '廃棄された軌道温室に、ひとりの小さなロボット。忘れられた種を見つけ、水を届け、静かな庭を育てていく。\n\n急ぐ必要はありません。光の移ろいと、葉の揺れる音を楽しみながら、自分だけの居場所をつくるゲームです。',
    cover_url: '/art/afterglow.png',
    genre: 'パズル・探索',
    development_status: 'プロトタイプ',
    status: 'published',
    sort_order: 1,
    release_date: null,
    tags: ['パズル', '癒やし'],
    technologies: ['Godot', 'Blender'],
    screenshots: ['/art/afterglow.png'],
    trailer_url: '',
    external_links: [],
    created_at: date,
    updated_at: date,
  },
];
export const demoPosts: Post[] = [
  [
    '光と影で、世界の温度をつくる',
    'lighting-the-void',
    'アート',
    'Volumetric Fogとライティングの小さな実験。静かな世界に、感情を宿すまで。',
  ],
  [
    '「気持ちいい移動」を、もう一度考える',
    'movement-feel',
    '開発日誌',
    '数値の調整から生まれる、プレイヤーと世界のつながり。',
  ],
  [
    '小さなスタジオの、大きな第一歩',
    'hello-world',
    'スタジオ',
    'この場所から、ゲームづくりの過程を少しずつ届けていきます。',
  ],
].map(([title, slug, category, excerpt], i) => ({
  id: `33333333-3333-4333-8333-33333333333${i}`,
  title,
  slug,
  category,
  excerpt,
  cover_url: i === 1 ? '/art/afterglow.png' : '/art/void.png',
  tags: ['制作ノート', i === 0 ? 'ライティング' : 'ゲーム開発'],
  status: 'published',
  published_at: `2026-09-${String(18 - i * 5).padStart(2, '0')}T00:00:00Z`,
  seo_title: '',
  seo_description: excerpt,
  created_at: date,
  updated_at: date,
  content: {
    type: 'doc',
    content: [
      { type: 'paragraph', content: [{ type: 'text', text: excerpt }] },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: '小さな違和感から始める' }],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: '美しい画面と、心地よい体験は同じではありません。実際に操作し、立ち止まり、世界を見渡す。その繰り返しの中で、少しずつゲームの輪郭を見つけていきます。',
          },
        ],
      },
      {
        type: 'blockquote',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'プレイヤーが何を見たかよりも、何を感じたかを大切にする。',
              },
            ],
          },
        ],
      },
      {
        type: 'codeBlock',
        attrs: { language: 'typescript' },
        content: [
          {
            type: 'text',
            text: 'const atmosphere = {\n  light: "soft",\n  silence: true,\n  curiosity: Infinity,\n};',
          },
        ],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'この記事はデザイン確認用のサンプルです。管理画面から実際の開発記録を投稿してください。',
          },
        ],
      },
    ],
  },
}));
