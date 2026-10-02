// Isolated demo and CMS browser fixture. No environment files or cloud credentials are copied.
import {
  cp,
  copyFile,
  readFile,
  appendFile,
  mkdir,
  mkdtemp,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
const source = fileURLToPath(new URL('../', import.meta.url));
const preview = await mkdtemp(join(tmpdir(), 'gilgame-feature-preview-'));
await cp(join(source, 'src'), join(preview, 'src'), { recursive: true });
for (const name of [
  'package.json',
  'next.config.ts',
  'postcss.config.mjs',
  'tsconfig.json',
])
  await copyFile(join(source, name), join(preview, name));
await symlink(
  join(source, 'node_modules'),
  join(preview, 'node_modules'),
  'dir',
);
await symlink(join(source, 'public'), join(preview, 'public'), 'dir');
await writeFile(
  join(preview, 'next.config.ts'),
  (await readFile(join(source, 'next.config.ts'), 'utf8')).replace(
    "allowedDevOrigins: ['host.docker.internal']",
    "allowedDevOrigins: ['host.docker.internal', 'gilgamestudio-web-1']",
  ),
);
await appendFile(
  join(preview, 'src/lib/demo.ts'),
  '\ndemoPosts[0].game_id = demoGames[0].id;\ndemoGames[0].primary_action = "demo";\ndemoGames[0].primary_url = "https://example.com/fixture-demo";\n',
);
const fixtureDir = join(preview, 'src/app/studio-test');
await mkdir(fixtureDir, { recursive: true });
await writeFile(
  join(fixtureDir, 'page.tsx'),
  `import { ContentEditor } from '@/components/content-editor';
import { demoPosts, demoGames } from '@/lib/demo';
export default function Fixture() { const post = { ...demoPosts[0], source_revision: 2 }; return <div className="admin-shell"><aside className="admin-sidebar"><p>STUDIO TEST</p></aside><main className="admin-main" id="main"><ContentEditor kind="posts" initial={post} games={demoGames} draftScope="browser-fixture" translation={{ post_id: post.id, locale: 'en', title: 'English draft', excerpt: '', content: { type: 'doc', content: [{ type: 'paragraph' }] }, category: '', tags: [], seo_title: '', seo_description: '', is_published: false, source_revision: 1 }} /></main></div>; }`,
);
const env = {
  ...process.env,
  NEXT_PUBLIC_SUPABASE_URL: '',
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: '',
  SUPABASE_SERVICE_ROLE_KEY: '',
  RESEND_API_KEY: '',
  CONTACT_FROM: '',
  CONTACT_TO: '',
  CONTACT_RATE_LIMIT_SECRET: '',
  NEXT_PUBLIC_SITE_URL: 'http://localhost:3002',
};
const child = spawn(
  process.execPath,
  [
    join(source, 'node_modules/next/dist/bin/next'),
    'dev',
    '--webpack',
    '--hostname',
    '0.0.0.0',
    '--port',
    '3002',
  ],
  { cwd: preview, env, stdio: 'inherit' },
);
process.on('SIGTERM', () => child.kill('SIGTERM'));
process.on('SIGINT', () => child.kill('SIGINT'));
child.on('exit', (code) => {
  process.exitCode = code || 0;
});
