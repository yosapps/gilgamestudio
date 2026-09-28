import { supabase, configured } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { validateUpload } from '@/lib/validation';
import { z } from 'zod';
import sharp from 'sharp';
import { readLimitedBody, isSameOrigin } from '@/lib/http';
export const runtime = 'nodejs';
async function authorize(req: Request) {
  if (!configured())
    return {
      error: NextResponse.json({ error: 'Supabase未設定' }, { status: 503 }),
    };
  const db = await supabase();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user)
    return {
      error: NextResponse.json(
        { error: 'ログインしてください' },
        { status: 401 },
      ),
    };
  const { data: admin } = await db.rpc('is_admin');
  if (!admin || !isSameOrigin(req))
    return {
      error: NextResponse.json(
        { error: '許可されていません' },
        { status: 403 },
      ),
    };
  return { db, user };
}
export async function POST(req: Request) {
  const auth = await authorize(req);
  if (auth.error) return auth.error;
  const { db, user } = auth;
  if (Number(req.headers.get('content-length') || 0) > 4 * 1024 * 1024 + 65536)
    return NextResponse.json(
      { error: 'ファイルが大きすぎます' },
      { status: 413 },
    );
  try {
    const bytes = await readLimitedBody(req, 4 * 1024 * 1024 + 65536);
    const form = await new Response(bytes, {
      headers: { 'Content-Type': req.headers.get('content-type') || '' },
    }).formData();
    const file = form.get('file');
    if (
      !(file instanceof File) ||
      !validateUpload(file.name, file.type, file.size)
    )
      return NextResponse.json(
        { error: 'JPEG / PNG / WebP、4MB以下のみアップロードできます' },
        { status: 400 },
      );
    const buffer = Buffer.from(await file.arrayBuffer());
    const metadata = await sharp(buffer, {
      limitInputPixels: 40_000_000,
    }).metadata();
    if (!['jpeg', 'png', 'webp'].includes(metadata.format || ''))
      return NextResponse.json(
        { error: '画像の内容が不正です' },
        { status: 400 },
      );
    const expected =
      metadata.format === 'jpeg' ? 'image/jpeg' : `image/${metadata.format}`;
    if (expected !== file.type)
      return NextResponse.json(
        { error: '画像形式と拡張子が一致しません' },
        { status: 400 },
      );
    const clean = await sharp(buffer, { limitInputPixels: 40_000_000 })
      .rotate()
      .webp({ quality: 90 })
      .toBuffer();
    if (clean.length > 4 * 1024 * 1024)
      return NextResponse.json(
        { error: '変換後の画像が4MBを超えています' },
        { status: 400 },
      );
    const path = `${user.id}/${crypto.randomUUID()}.webp`;
    const { error } = await db.storage
      .from('media')
      .upload(path, clean, { contentType: 'image/webp', upsert: false });
    if (error) throw error;
    const {
      data: { publicUrl },
    } = db.storage.from('media').getPublicUrl(path);
    const { data: media, error: insertError } = await db
      .from('media')
      .insert({
        path,
        url: publicUrl,
        name: file.name.slice(0, 200),
        mime_type: 'image/webp',
        size: clean.length,
        created_by: user.id,
      })
      .select('*')
      .single();
    if (insertError) {
      await db.storage.from('media').remove([path]);
      throw insertError;
    }
    return NextResponse.json({ media });
  } catch {
    return NextResponse.json(
      {
        error:
          '画像を保存できませんでした。形式・サイズ・Storage設定をご確認ください。',
      },
      { status: 400 },
    );
  }
}
export async function DELETE(req: Request) {
  const auth = await authorize(req);
  if (auth.error) return auth.error;
  const { db } = auth;
  const body = await req.json().catch(() => null);
  if (!z.uuid().safeParse(body?.id).success)
    return NextResponse.json({ error: 'IDが不正です' }, { status: 400 });
  const { data: media } = await db
    .from('media')
    .select('path,url')
    .eq('id', body.id)
    .single();
  if (!media)
    return NextResponse.json(
      { error: '画像が見つかりません' },
      { status: 404 },
    );
  const [posts, games, settings] = await Promise.all([
    db.from('posts').select('cover_url,content'),
    db.from('games').select('cover_url,screenshots'),
    db.from('site_settings').select('og_image'),
  ]);
  if ([posts, games, settings].some((x) => x.error))
    return NextResponse.json(
      { error: '使用状況を確認できませんでした' },
      { status: 500 },
    );
  if (
    JSON.stringify([posts.data, games.data, settings.data]).includes(media.url)
  )
    return NextResponse.json(
      {
        error:
          'この画像は使用中です。記事・ゲーム・サイト設定から外してから削除してください。',
      },
      { status: 409 },
    );
  const { error } = await db.storage.from('media').remove([media.path]);
  if (error)
    return NextResponse.json(
      { error: 'Storageから削除できませんでした' },
      { status: 500 },
    );
  const { error: dbError } = await db.from('media').delete().eq('id', body.id);
  if (dbError)
    return NextResponse.json(
      {
        error:
          '画像は削除されましたが一覧の更新に失敗しました。再度削除してください。',
      },
      { status: 500 },
    );
  return NextResponse.json({ ok: true });
}
