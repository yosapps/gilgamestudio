import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
const browser = await chromium.launch();
await mkdir('test-results/pages', { recursive: true });
for (const width of [1440, 390]) {
  const page = await browser.newPage({ viewport: { width, height: 960 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const path of ['about', 'games', 'blog', 'contact', 'login']) {
    await page.goto(
      `${process.env.E2E_BASE_URL || 'http://localhost:3000'}/${path}`,
      { waitUntil: 'networkidle' },
    );
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: `test-results/pages/${path}-${width}.png`,
      fullPage: true,
    });
  }
  console.log(JSON.stringify({ width, errors }));
  await page.close();
}
await browser.close();
