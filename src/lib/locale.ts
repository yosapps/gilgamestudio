export type Locale = 'ja' | 'en';
export const localeCookie = 'gilgame_locale';

export function resolveLocale(saved?: string, accepted = ''): Locale {
  if (saved === 'ja' || saved === 'en') return saved;
  const languages = accepted
    .split(',')
    .map((entry, index) => {
      const [tag, ...parameters] = entry.trim().toLowerCase().split(';');
      const q = parameters.find((parameter) =>
        parameter.trim().startsWith('q='),
      );
      return { tag, weight: q ? Number(q.trim().slice(2)) : 1, index };
    })
    .filter(
      ({ tag, weight }) =>
        !!tag && Number.isFinite(weight) && weight > 0 && weight <= 1,
    )
    .sort((a, b) => b.weight - a.weight || a.index - b.index);
  for (const { tag } of languages) {
    if (tag === 'ja' || tag.startsWith('ja-')) return 'ja';
    if (tag === 'en' || tag.startsWith('en-')) return 'en';
  }
  return languages.length ? 'en' : 'ja';
}
