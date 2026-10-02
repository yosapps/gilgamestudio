import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { localeCookie, resolveLocale } from '@/lib/locale';
const publicPath =
  /^\/(?:$|games(?:\/|$)|blog(?:\/|$)|about$|contact$|press$|discover$|minigames(?:\/|$)|feed\.xml$)/;
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const english = pathname === '/en' || pathname.startsWith('/en/');
  const japanese = pathname === '/ja' || pathname.startsWith('/ja/');
  const normalized = english || japanese ? pathname.slice(3) || '/' : pathname;
  if ((english || japanese) && !publicPath.test(normalized)) {
    const headers = new Headers(request.headers);
    headers.set('x-gilgame-locale', english ? 'en' : 'ja');
    headers.set('x-gilgame-pathname', normalized);
    return NextResponse.next({ request: { headers } });
  }
  if (publicPath.test(normalized)) {
    if (japanese) {
      const url = request.nextUrl.clone();
      url.pathname = normalized;
      return NextResponse.redirect(url, 308);
    }
    if (
      pathname === '/' &&
      resolveLocale(
        request.cookies.get(localeCookie)?.value,
        request.headers.get('accept-language') || '',
      ) === 'en'
    ) {
      const url = request.nextUrl.clone();
      url.pathname = '/en';
      const response = NextResponse.redirect(url, 307);
      response.headers.set('Vary', 'Cookie, Accept-Language');
      response.headers.set('Cache-Control', 'private, no-store');
      return response;
    }
    const headers = new Headers(request.headers);
    headers.set('x-gilgame-locale', english ? 'en' : 'ja');
    headers.set('x-gilgame-pathname', normalized);
    if (english) {
      const url = request.nextUrl.clone();
      url.pathname = normalized;
      return NextResponse.rewrite(url, { request: { headers } });
    }
    return NextResponse.next({ request: { headers } });
  }
  let response = NextResponse.next({ request });
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  )
    return response;
  const db = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(values) {
          values.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          values.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );
  await db.auth.getUser();
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}
export const config = {
  matcher: [
    '/',
    '/en/:path*',
    '/ja/:path*',
    '/games/:path*',
    '/blog/:path*',
    '/about',
    '/contact',
    '/press',
    '/discover',
    '/minigames/:path*',
    '/feed.xml',
    '/admin/:path*',
    '/login',
    '/api/admin/:path*',
  ],
};
