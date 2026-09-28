/** UI dictionaries are separate from CMS content; add `en` before introducing /[locale]. */
export const defaultLocale = 'ja' as const;
export const dictionaries = {
  ja: {
    navigation: {
      games: 'Games',
      journal: 'Journal',
      about: 'About',
      contact: 'Contact',
    },
    hero: {
      headline: '小さな一歩から、',
      accent: 'きらめく冒険へ。',
      games: 'ゲームを探索する',
      journal: '開発の舞台裏へ',
    },
    footer: '小さな一歩から、きらめく冒険へ。',
  },
};
export const messages = dictionaries[defaultLocale];
