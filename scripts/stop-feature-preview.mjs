// Stop only the isolated feature-preview helper inside the Linux development container.
import { readdir, readFile } from 'node:fs/promises';
for (const entry of await readdir('/proc')) {
  if (!/^\d+$/.test(entry)) continue;
  try {
    const args = (await readFile('/proc/' + entry + '/cmdline', 'utf8')).split(
      '\0',
    );
    if (args[1] === 'scripts/feature-preview.mjs')
      process.kill(Number(entry), 'SIGTERM');
  } catch {
    /* process already exited */
  }
}
