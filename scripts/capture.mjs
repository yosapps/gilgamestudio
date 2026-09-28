import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
const browser = await chromium.launch({
  args: ['--enable-unsafe-swiftshader'],
});
await mkdir('test-results/visual', { recursive: true });
for (const [name, width, height] of [
  ['desktop', 1440, 960],
  ['mobile', 390, 844],
]) {
  const page = await browser.newPage({
    viewport: { width, height },
    deviceScaleFactor: 1,
  });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  await page.goto(process.env.E2E_BASE_URL || 'http://localhost:3000', {
    waitUntil: 'networkidle',
  });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForSelector('.hero-art canvas', { timeout: 30000 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `test-results/visual/home-${name}.png` });
  for (
    let y = 0;
    y < (await page.evaluate(() => document.body.scrollHeight));
    y += 600
  ) {
    await page.evaluate((y) => scrollTo(0, y), y);
    await page.waitForTimeout(100);
  }
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({
    path: `test-results/visual/home-${name}-full.png`,
    fullPage: true,
  });
  console.log(JSON.stringify({ viewport: name, errors }));
  await page.close();
}
await browser.close();
