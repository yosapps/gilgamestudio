import { configured, supabase } from './supabase';
import { NextResponse } from 'next/server';
export async function adminApi() {
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
  const { data, error } = await db.rpc('is_admin');
  if (error || !data)
    return {
      error: NextResponse.json(
        { error: '管理者権限がありません' },
        { status: 403 },
      ),
    };
  return { db, user };
}
