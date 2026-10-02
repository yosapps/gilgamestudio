import { adminApi } from '@/lib/admin-api';
import { NextResponse } from 'next/server';
export async function GET(request: Request) {
  const auth = await adminApi();
  if (auth.error) return auth.error;
  const url = new URL(request.url);
  const term = (url.searchParams.get('q') || '')
    .slice(0, 100)
    .replace(/[%_\\]/g, '');
  const page = Math.min(
    1000,
    Math.max(0, Math.trunc(Number(url.searchParams.get('page')) || 0)),
  );
  let query = auth.db
    .from('media')
    .select('id,name,url,size')
    .order('created_at', { ascending: false });
  if (term) query = query.ilike('name', '%' + term + '%');
  const { data, error } = await query.range(page * 48, page * 48 + 48);
  if (error)
    return NextResponse.json(
      { error: '画像を取得できませんでした' },
      { status: 503 },
    );
  return NextResponse.json(
    { items: data.slice(0, 48), hasMore: data.length > 48 },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
}
