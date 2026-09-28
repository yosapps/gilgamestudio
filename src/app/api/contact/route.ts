import { readLimitedBody, isSameOrigin } from '@/lib/http';
import { contactSchema } from '@/lib/validation';
import { NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
export async function POST(req: Request) {
  if (!isSameOrigin(req))
    return NextResponse.json(
      { error: '送信元を確認できません' },
      { status: 403 },
    );
  const {
    RESEND_API_KEY,
    CONTACT_FROM,
    CONTACT_TO,
    NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    CONTACT_RATE_LIMIT_SECRET,
  } = process.env;
  if (
    !RESEND_API_KEY ||
    !CONTACT_FROM ||
    !CONTACT_TO ||
    !NEXT_PUBLIC_SUPABASE_URL ||
    !NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    !CONTACT_RATE_LIMIT_SECRET
  )
    return NextResponse.json(
      { error: 'お問い合わせフォームは準備中です' },
      { status: 503 },
    );
  let value: string;
  try {
    value = new TextDecoder().decode(await readLimitedBody(req, 20000));
  } catch {
    return NextResponse.json({ error: '入力が長すぎます' }, { status: 413 });
  }
  let body;
  try {
    body = JSON.parse(value);
  } catch {
    return NextResponse.json({ error: '入力形式が不正です' }, { status: 400 });
  }
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: '入力内容をご確認ください' },
      { status: 400 },
    );
  const ip =
    req.headers.get('x-vercel-forwarded-for')?.split(',')[0] ||
    req.headers.get('x-forwarded-for')?.split(',')[0] ||
    'local';
  const fingerprint = createHash('sha256')
    .update(`${CONTACT_RATE_LIMIT_SECRET}:${ip}`)
    .digest('hex');
  const db = createClient(
    NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
  const { data: allowed, error } = await db.rpc('consume_contact_limit', {
    fingerprint,
  });
  if (error)
    return NextResponse.json(
      { error: '現在送信できません。時間をおいてお試しください。' },
      { status: 503 },
    );
  if (!allowed)
    return NextResponse.json(
      { error: '送信回数の上限です。1時間後にお試しください。' },
      { status: 429 },
    );
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: CONTACT_FROM,
        to: [CONTACT_TO],
        reply_to: parsed.data.email,
        subject: `サイトからのお問い合わせ: ${parsed.data.name}`,
        text: `お名前: ${parsed.data.name}\nメール: ${parsed.data.email}\n\n${parsed.data.message}`,
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error('delivery');
    return NextResponse.json({
      message: 'お問い合わせを送信しました。ありがとうございます。',
    });
  } catch {
    return NextResponse.json(
      { error: '送信できませんでした。時間をおいて再度お試しください。' },
      { status: 502 },
    );
  }
}
