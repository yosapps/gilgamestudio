import { supabase, configured } from '@/lib/supabase';
import {
  postSchema,
  gameSchema,
  settingsSchema,
  postTranslationSchema,
  gameTranslationSchema,
} from '@/lib/validation';
import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { z } from 'zod';
import { readLimitedBody, isSameOrigin } from '@/lib/http';
const resources = {
  posts: postSchema,
  games: gameSchema,
  settings: settingsSchema,
  'post-translations': postTranslationSchema,
  'game-translations': gameTranslationSchema,
};
export async function POST(
  req: Request,
  { params }: { params: Promise<{ resource: string }> },
) {
  if (!configured())
    return NextResponse.json({ error: 'Supabase未設定' }, { status: 503 });
  const db = await supabase();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user)
    return NextResponse.json(
      { error: 'ログインしてください' },
      { status: 401 },
    );
  const { data: admin } = await db.rpc('is_admin');
  if (!admin)
    return NextResponse.json(
      { error: '管理者権限がありません' },
      { status: 403 },
    );
  if (!isSameOrigin(req))
    return NextResponse.json({ error: '不正な送信元です' }, { status: 403 });
  const { resource } = await params;
  if (!Object.hasOwn(resources, resource))
    return NextResponse.json({ error: '対象がありません' }, { status: 404 });
  let text: string;
  try {
    text = new TextDecoder().decode(await readLimitedBody(req, 1_200_000));
  } catch {
    return NextResponse.json(
      { error: 'データが大きすぎます' },
      { status: 413 },
    );
  }
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    return NextResponse.json(
      { error: 'データ形式が不正です' },
      { status: 400 },
    );
  }
  if (!body || typeof body !== 'object')
    return NextResponse.json(
      { error: 'データ形式が不正です' },
      { status: 400 },
    );
  const translation =
    resource === 'post-translations' || resource === 'game-translations';
  const parent = resource === 'post-translations' ? 'posts' : 'games';
  const table =
    resource === 'settings' ? 'site_settings' : resource.replace('-', '_');
  const primaryKey = translation
    ? parent === 'posts'
      ? 'post_id'
      : 'game_id'
    : 'id';
  const cacheTag = translation ? parent : resource;
  const id = body.id;
  if (translation && !id)
    return NextResponse.json(
      { error: '日本語版を先に保存してください。' },
      { status: 400 },
    );
  if (resource !== 'settings' && id && !z.uuid().safeParse(id).success)
    return NextResponse.json({ error: 'IDが不正です' }, { status: 400 });
  if (body.action === 'delete') {
    if (resource === 'settings' || !id)
      return NextResponse.json({ error: '削除できません' }, { status: 400 });
    const { data, error } = await db
      .from(table)
      .delete()
      .eq(primaryKey, id)
      .select(primaryKey)
      .single();
    if (error || !data)
      return NextResponse.json(
        { error: '削除に失敗しました。再読み込みしてください。' },
        { status: 409 },
      );
    revalidateTag(cacheTag, { expire: 0 });
    return NextResponse.json({ ok: true });
  }
  const parsed = resources[resource as keyof typeof resources].safeParse(
    body.data,
  );
  if (!parsed.success)
    return NextResponse.json(
      {
        error: parsed.error.issues
          .map((i) => `${i.path.join('.')}: ${i.message}`)
          .join(' / '),
      },
      { status: 400 },
    );
  const payload: Record<string, unknown> = parsed.data;
  const query = translation
    ? db
        .from(table)
        .upsert({ ...payload, [primaryKey]: id }, { onConflict: primaryKey })
    : resource === 'settings'
      ? db.from(table).update(payload).eq('id', 1)
      : id
        ? db.from(table).update(payload).eq('id', id)
        : db.from(table).insert(payload);
  const { data, error } = await query.select(primaryKey).single();
  if (error)
    return NextResponse.json(
      {
        error:
          error.code === 'PGRST205' || error.code === '42P01'
            ? '英語テーブルが未作成です。翻訳マイグレーションを実行してください。'
            : error.code === '23503'
              ? '元の記事・ゲームがありません。再読み込みしてください。'
              : error.code === '23505'
                ? 'このスラッグはすでに使われています。'
                : '保存に失敗しました。入力内容と接続をご確認ください。',
      },
      { status: 409 },
    );
  revalidateTag(cacheTag, { expire: 0 });
  return NextResponse.json({ ok: true, id: data[primaryKey] });
}
