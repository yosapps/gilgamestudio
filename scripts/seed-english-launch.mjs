import { createClient } from '@supabase/supabase-js';
import { readFile } from 'node:fs/promises';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key)
  throw new Error('Server-only Supabase maintenance credentials are required.');
const db = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const translation = JSON.parse(
  await readFile('docs/releases/site-launch.en.json', 'utf8'),
);
const { data: parent, error } = await db
  .from('posts')
  .select('id,title,slug,status,published_at')
  .eq('slug', 'official-website-launch')
  .single();
if (error)
  throw new Error(
    `Could not read the existing launch article (${error.code}).`,
  );
if (parent.title !== 'Gilgame studio 公式サイトを公開しました')
  throw new Error(
    'Source title has changed. Review the English copy before seeding.',
  );
const { data: existing, error: lookupError } = await db
  .from('post_translations')
  .select('post_id,title,is_published')
  .eq('post_id', parent.id)
  .maybeSingle();
if (lookupError)
  throw new Error(
    `Translation table is not ready (${lookupError.code}). Apply 202609290001_content_translations.sql first.`,
  );
if (existing) {
  console.log(
    JSON.stringify({ alreadyRegistered: true, translation: existing }),
  );
} else if (!process.argv.includes('--apply')) {
  console.log(
    JSON.stringify({
      preview: true,
      parent: parent.slug,
      title: translation.title,
      published: translation.is_published,
    }),
  );
} else {
  const { data, error: insertError } = await db
    .from('post_translations')
    .insert({ ...translation, post_id: parent.id })
    .select('post_id,locale,title,is_published')
    .single();
  if (insertError)
    throw new Error(
      `Could not register English article (${insertError.code}).`,
    );
  console.log(JSON.stringify({ registered: data }));
}
if (process.argv.includes('--apply')) {
  const publicDb = createClient(
    url,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    { auth: { persistSession: false } },
  );
  const { data, error: publicError } = await publicDb
    .from('post_translations')
    .select('post_id,title,content')
    .eq('post_id', parent.id)
    .single();
  if (publicError)
    throw new Error(
      `Public English article verification failed (${publicError.code}).`,
    );
  const { data: original, error: originalError } = await db
    .from('posts')
    .select('title')
    .eq('id', parent.id)
    .single();
  if (originalError || original.title !== parent.title)
    throw new Error('Source article verification failed.');
  console.log(
    JSON.stringify({
      publicRead: true,
      title: data.title,
      originalPreserved: true,
      bodyBlocks: data.content.content.length,
    }),
  );
}
