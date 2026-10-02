import 'server-only';
import { cache } from 'react';
import { cookies, headers } from 'next/headers';
import { localeCookie, resolveLocale } from './locale';
import { translator } from './translations';

export const getLocale = cache(async () => {
  const [jar, requestHeaders] = await Promise.all([cookies(), headers()]);
  const explicit = requestHeaders.get('x-gilgame-locale');
  if (explicit === 'ja' || explicit === 'en') return explicit;
  return resolveLocale(
    jar.get(localeCookie)?.value,
    requestHeaders.get('accept-language') || '',
  );
});
export async function getTranslator() {
  return translator(await getLocale());
}
