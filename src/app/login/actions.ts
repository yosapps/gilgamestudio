'use server';
import { supabase } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { z } from 'zod';
export async function login(_: { error: string }, form: FormData) {
  const parsed = z
    .object({ email: z.email(), password: z.string().min(1).max(200) })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success)
    return { error: 'メールアドレスとパスワードを確認してください。' };
  let db;
  try {
    db = await supabase();
  } catch {
    return { error: 'Supabaseの接続設定が必要です。READMEをご確認ください。' };
  }
  const { error } = await db.auth.signInWithPassword(parsed.data);
  if (error)
    return { error: 'ログインできませんでした。入力情報をご確認ください。' };
  const { data } = await db.rpc('is_admin');
  if (!data) {
    await db.auth.signOut();
    return { error: 'このアカウントには管理者権限がありません。' };
  }
  redirect('/admin');
}
export async function logout() {
  const db = await supabase();
  await db.auth.signOut();
  redirect('/login');
}
