export const minigames = [
  {
    slug: 'gilgame-stars',
    title: 'ギルガメの星あつめ',
    description:
      '左右に動いて、落ちてくる星をキャッチ。30秒のやさしい星あつめ。',
    category: '星あつめ',
    duration: '1回30秒',
    difficulty: 'やさしい',
    tips: [
      {
        title: '左右に移動',
        text: '星の下へギルガメを動かそう。画面のタップか、← → キーで移動できます。',
      },
      {
        title: '星をキャッチ',
        text: '星を1つ集めると10点。取り逃しても減点はありません。',
      },
      {
        title: '30秒でひと遊び',
        text: '時間がきたらスコアをチェック。何度でも気軽に遊べます。',
      },
    ],
  },
  {
    slug: 'gilgame-runner',
    title: 'ギルガメと、ひと走り。',
    description:
      'ジャンプとしゃがみでクリスタルを避ける、ブラウザで遊べるミニゲームです。',
    category: 'ランニング',
    duration: '記録に挑戦',
    difficulty: 'タイミングで挑戦',
    tips: [
      { title: 'ジャンプ', text: '地面のクリスタルを飛び越えよう。' },
      {
        title: 'しゃがむ',
        text: '浮かぶクリスタルは、低くなって通り抜けよう。',
      },
      {
        title: '記録に挑戦',
        text: '走るほどスコアアップ。自己ベストを更新しよう。',
      },
    ],
  },
] as const;

export function getMinigame(slug: string) {
  return minigames.find((game) => game.slug === slug);
}
