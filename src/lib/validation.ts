import { z } from 'zod';
export const safeUrl = z
  .string()
  .max(2048)
  .refine((v) => {
    if (!v) return true;
    try {
      return new URL(v).protocol === 'https:';
    } catch {
      return false;
    }
  }, 'https URLを入力してください');
export const imageUrl = z
  .string()
  .max(2048)
  .refine(
    (v) =>
      !v ||
      ['/gilgame.png', '/gilgame-sit.png', '/logo.png'].includes(v) ||
      /^\/art\/[a-zA-Z0-9_.-]+$/.test(v) ||
      (() => {
        try {
          const u = new URL(v);
          return (
            u.protocol === 'https:' &&
            /^[a-z0-9-]+\.supabase\.co$/.test(u.hostname) &&
            u.pathname.startsWith('/storage/v1/object/public/media/') &&
            !u.username &&
            !u.password
          );
        } catch {
          return false;
        }
      })(),
    'メディア管理のSupabase画像URLを指定してください',
  );
const slug = z
  .string()
  .min(1)
  .max(100)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    '半角英数字とハイフンで入力してください',
  );
const status = z.enum(['draft', 'published', 'scheduled', 'archived']);
const strings = z.array(z.string().trim().min(1).max(80)).max(30);
const links = z
  .array(
    z.object({
      label: z.string().min(1).max(40),
      url: safeUrl.refine(Boolean),
    }),
  )
  .max(12);
const nodeTypes = new Set([
  'doc',
  'paragraph',
  'heading',
  'text',
  'bulletList',
  'orderedList',
  'listItem',
  'blockquote',
  'codeBlock',
  'hardBreak',
  'horizontalRule',
  'image',
]);
function validRichNode(value: unknown, depth = 0): boolean {
  if (depth > 25 || !value || typeof value !== 'object' || Array.isArray(value))
    return false;
  const n = value as Record<string, unknown>;
  if (typeof n.type !== 'string' || !nodeTypes.has(n.type)) return false;
  if (n.text !== undefined && typeof n.text !== 'string') return false;
  if (
    n.content !== undefined &&
    (!Array.isArray(n.content) ||
      !n.content.every((v) => validRichNode(v, depth + 1)))
  )
    return false;
  if (
    n.attrs !== undefined &&
    (!n.attrs || typeof n.attrs !== 'object' || Array.isArray(n.attrs))
  )
    return false;
  const attrs = n.attrs as Record<string, unknown> | undefined;
  if (
    n.type === 'image' &&
    (!attrs?.src || !imageUrl.safeParse(attrs.src).success)
  )
    return false;
  if (n.type === 'heading' && ![2, 3].includes(Number(attrs?.level)))
    return false;
  if (
    n.marks !== undefined &&
    (!Array.isArray(n.marks) ||
      !n.marks.every((m: unknown) => {
        if (!m || typeof m !== 'object') return false;
        const mark = m as { type?: string; attrs?: { href?: unknown } };
        return (
          ['bold', 'italic', 'strike', 'code', 'underline'].includes(
            mark.type || '',
          ) ||
          (mark.type === 'link' &&
            !!mark.attrs?.href &&
            safeUrl.safeParse(mark.attrs.href).success)
        );
      }))
  )
    return false;
  return true;
}
export const richDocument = z
  .object({ type: z.literal('doc'), content: z.array(z.unknown()).optional() })
  .refine(
    (v) => JSON.stringify(v).length <= 300000 && validRichNode(v),
    '本文の形式・URL・サイズが不正です',
  );
export const postSchema = z
  .object({
    game_id: z.uuid().nullable().optional(),
    title: z.string().trim().min(1).max(200),
    slug,
    excerpt: z.string().max(500),
    content: richDocument,
    cover_url: imageUrl,
    category: z.string().max(80),
    tags: strings,
    status,
    published_at: z.iso.datetime({ offset: true }).nullable(),
    seo_title: z.string().max(200),
    seo_description: z.string().max(500),
  })
  .refine(
    (v) =>
      !['published', 'scheduled'].includes(v.status) || v.published_at !== null,
    { message: '公開日時を指定してください', path: ['published_at'] },
  );
export const gameSchema = z.object({
  primary_action: z
    .enum(['auto', 'wishlist', 'demo', 'buy', 'none'])
    .optional(),
  primary_url: safeUrl.optional(),
  title: z.string().trim().min(1).max(200),
  slug,
  description: z.string().max(500),
  body: z.string().max(50000),
  cover_url: imageUrl,
  genre: z.string().min(1).max(80),
  development_status: z.enum([
    '開発中',
    'プロトタイプ',
    'リリース済み',
    '開発休止',
  ]),
  status: z.enum(['draft', 'published', 'archived']),
  sort_order: z.number().int().min(0).max(9999),
  release_date: z.iso.date().nullable(),
  tags: strings,
  technologies: strings,
  screenshots: z.array(imageUrl.refine(Boolean)).max(20),
  trailer_url: safeUrl.refine(
    (v) => !v || !!youtubeId(v),
    'YouTubeのURLを指定してください',
  ),
  external_links: links,
});
export const settingsSchema = z.object({
  press_guidelines: z.string().max(5000).optional(),
  press_guidelines_en: z.string().max(5000).optional(),
  site_name: z.string().trim().min(1).max(100),
  description: z.string().max(500),
  profile: z.string().max(5000),
  og_image: imageUrl,
  social_links: links,
});
export const postTranslationSchema = z.object({
  source_revision: z.number().int().positive().optional(),
  locale: z.literal('en'),
  title: z.string().trim().min(1).max(200),
  excerpt: z.string().max(500),
  content: richDocument,
  category: z.string().max(80),
  tags: strings,
  seo_title: z.string().max(200),
  seo_description: z.string().max(500),
  is_published: z.boolean(),
});
export const gameTranslationSchema = z.object({
  source_revision: z.number().int().positive().optional(),
  locale: z.literal('en'),
  title: z.string().trim().min(1).max(200),
  description: z.string().max(500),
  body: z.string().max(50000),
  genre: z.string().max(80),
  tags: strings,
  external_links: links,
  is_published: z.boolean(),
});
export const contactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.email().max(254),
  message: z.string().trim().min(10).max(5000),
  website: z.string().max(0),
});
export function youtubeId(url: string) {
  try {
    const u = new URL(url);
    const id =
      u.hostname === 'youtu.be'
        ? u.pathname.slice(1)
        : ['www.youtube.com', 'youtube.com'].includes(u.hostname)
          ? u.searchParams.get('v')
          : null;
    return id && /^[\w-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}
export function isPublicPost(
  post: { status: string; published_at: string | null },
  now = new Date(),
) {
  return (
    ['published', 'scheduled'].includes(post.status) &&
    !!post.published_at &&
    new Date(post.published_at) <= now
  );
}
export function validateUpload(name: string, type: string, size: number) {
  const ext = name.split('.').pop()?.toLowerCase();
  return (
    size > 0 &&
    size <= 4 * 1024 * 1024 &&
    ((type === 'image/jpeg' && ['jpg', 'jpeg'].includes(ext || '')) ||
      (type === 'image/png' && ext === 'png') ||
      (type === 'image/webp' && ext === 'webp'))
  );
}
