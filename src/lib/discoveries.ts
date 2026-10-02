export const discoveries = [
  {
    id: 'home',
    name: 'はじめの一歩',
    detail: '新しい冒険の入り口で見つけたギルガメ。',
    path: '/',
  },
  {
    id: 'games',
    name: '世界をつくる',
    detail: '小さなアイデアが、遊べる世界になっていく。',
    path: '/games',
  },
  {
    id: 'journal',
    name: '寄り道の発見',
    detail: '制作の足あとには、新しい発見がいっぱい。',
    path: '/blog',
  },
  {
    id: 'about',
    name: 'スタジオの相棒',
    detail: 'きらめく好奇心を持った、小さな相棒。',
    path: '/about',
  },
] as const;
export function parseDiscoveries(raw: string | null): string[] {
  try {
    const ids = JSON.parse(raw || '[]');
    return Array.isArray(ids)
      ? [
          ...new Set(
            ids.filter(
              (id): id is string =>
                typeof id === 'string' &&
                discoveries.some((item) => item.id === id),
            ),
          ),
        ]
      : [];
  } catch {
    return [];
  }
}
