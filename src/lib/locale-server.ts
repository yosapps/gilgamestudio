import 'server-only';
import { cache } from 'react';
import { cookies, headers } from 'next/headers';
import { localeCookie, resolveLocale } from './locale';
import { translator } from './translations';
import { contentEnglish } from './content-translations';

export const getLocale = cache(async () => {
  const [jar, requestHeaders] = await Promise.all([cookies(), headers()]);
  return resolveLocale(
    jar.get(localeCookie)?.value,
    requestHeaders.get('accept-language') || '',
  );
});
export async function getTranslator() {
  const locale = await getLocale();
  const ui = translator(locale);
  return (text: string) =>
    locale === 'en' ? contentEnglish[text] || ui(text) : text;
}
