import { createClient } from '@supabase/supabase-js';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key)
  throw new Error('Server-only Supabase maintenance credentials are required.');
const db = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const { data: before, error } = await db
  .from('site_settings')
  .select('*')
  .eq('id', 1)
  .single();
if (error) throw new Error(error.message);
const changes = {
  site_name: 'Gilgame studio',
  description:
    '小さな一歩から、きらめく冒険へ。ギルガメとともに、思わず笑顔になるゲームをつくる個人開発スタジオ。',
  profile:
    'Gilgame studioは、小さな「やってみたい」をゲームにする個人開発スタジオです。水色のからだと金色の甲羅、額にきらめくクリスタルが目印の「ギルガメ」と一緒に、発見する楽しさ、できたときのうれしさ、また会いたくなる世界を大切につくっています。',
  og_image: '/logo.png',
};
if (!process.argv.includes('--apply')) {
  console.log(JSON.stringify({ preview: changes }, null, 2));
  process.exit(0);
}
const backupDir = resolve('tmp/brand-backups');
await mkdir(backupDir, { recursive: true });
const backup = resolve(backupDir, `settings-${Date.now()}.json`);
await writeFile(backup, JSON.stringify(before, null, 2), { flag: 'wx' });
const { data: updated, error: updateError } = await db
  .from('site_settings')
  .update(changes)
  .eq('id', 1)
  .select('id,site_name,description,profile,og_image')
  .single();
if (updateError) throw new Error(updateError.message);
console.log(JSON.stringify({ backup, updated }, null, 2));
