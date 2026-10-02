import { test, expect } from '@playwright/test';
test.use({ locale: 'ja-JP' });

test('404 runner starts, jumps, ducks, pauses, retries, and keeps the best score', async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    if (!localStorage.getItem('gilgame:runner:best:v1'))
      localStorage.setItem('gilgame:runner:best:v1', '3');
  });
  const response = await page.goto('/runner-page-does-not-exist');
  expect(response?.status()).toBe(404);
  await expect(page.locator('h1')).toContainText('ここは、まだ未知の世界。');
  const game = page.getByRole('region', { name: 'GILGAME RUN' });
  const canvas = page.getByRole('img', { name: 'ギルガメのランニングゲーム' });
  await expect(page.getByLabel('自己ベスト', { exact: true })).toHaveText(
    '00003',
  );
  await expect(game).toHaveAttribute('data-phase', 'ready');
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  await page.screenshot({
    path: 'test-results/runner-ready-' + testInfo.project.name + '.png',
    fullPage: true,
  });
  await page
    .getByRole('button', { name: '冒険をはじめる', exact: true })
    .click();
  await expect(game).toHaveAttribute('data-phase', 'running');
  await canvas.press('ArrowDown');
  const duck = page.getByRole('button', { name: 'しゃがむ', exact: true });
  await duck.focus();
  await page.keyboard.down('Space');
  await expect(duck).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.up('Space');
  await expect(duck).toHaveAttribute('aria-pressed', 'false');
  await page.getByRole('button', { name: '一時停止', exact: true }).click();
  await expect(game).toHaveAttribute('data-phase', 'paused');
  const pausedScore = await page
    .getByLabel('スコア', { exact: true })
    .innerText();
  await page.waitForTimeout(250);
  await expect(page.getByLabel('スコア', { exact: true })).toHaveText(
    pausedScore,
  );
  await page.screenshot({
    path: 'test-results/runner-paused-' + testInfo.project.name + '.png',
    fullPage: true,
  });
  await page
    .getByRole('button', { name: 'つづける', exact: true })
    .first()
    .click();
  await expect(game).toHaveAttribute('data-phase', 'running');
  await canvas.press('Escape');
  await expect(game).toHaveAttribute('data-phase', 'paused');
  await canvas.press('Space');
  await expect(game).toHaveAttribute('data-phase', 'running');
  await expect(game).toHaveAttribute('data-phase', 'over', { timeout: 12000 });
  await expect(
    page.getByRole('button', { name: 'もう一度遊ぶ', exact: true }),
  ).toBeVisible();
  const finalScore = Number(
    await page.getByLabel('スコア', { exact: true }).innerText(),
  );
  expect(finalScore).toBeGreaterThan(3);
  expect(
    await page.evaluate(() => localStorage.getItem('gilgame:runner:best:v1')),
  ).toBe(String(finalScore));
  await page.screenshot({
    path: 'test-results/runner-over-' + testInfo.project.name + '.png',
    fullPage: true,
  });
  await page.getByRole('button', { name: 'もう一度遊ぶ', exact: true }).click();
  await expect(game).toHaveAttribute('data-phase', 'running');
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await expect(game).toHaveAttribute('data-phase', 'paused');
  await page.getByRole('link', { name: 'ホームへ戻る', exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  await page.goto('/runner-page-does-not-exist');
  await expect(page.getByLabel('自己ベスト', { exact: true })).toHaveText(
    String(finalScore).padStart(5, '0'),
  );
  expect(errors).toEqual([]);
});

test('English 404 uses tap controls and still works without browser storage', async ({
  page,
}, testInfo) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new Error('Storage disabled');
    };
    Storage.prototype.setItem = () => {
      throw new Error('Storage disabled');
    };
  });
  const response = await page.goto('/en/runner-page-does-not-exist');
  expect(response?.status()).toBe(404);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(
    page.getByRole('button', { name: 'Start running', exact: true }),
  ).toBeEnabled();
  const canvas = page.getByRole('img', { name: 'Gilgame running game' });
  if (testInfo.project.name === 'mobile')
    await canvas.tap({ position: { x: 80, y: 205 } });
  else await canvas.click({ position: { x: 80, y: 205 } });
  const game = page.getByRole('region', { name: 'GILGAME RUN' });
  await expect(game).toHaveAttribute('data-phase', 'running');
  await canvas.press('KeyP');
  await expect(game).toHaveAttribute('data-phase', 'paused');
  await expect(
    page.getByRole('link', { name: 'Back to home', exact: true }),
  ).toHaveAttribute('href', '/en');
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
});

type SpriteDraw = { clip: string; frame: string; y: number; height: number };
type SpriteWindow = Window & { __gilgameSpriteDraws: SpriteDraw[] };
test('generated run, jump, and crouch poses are drawn and freeze on pause', async ({
  page,
}, testInfo) => {
  await page.addInitScript(() => {
    const target = window as unknown as SpriteWindow;
    target.__gilgameSpriteDraws = [];
    const original = CanvasRenderingContext2D.prototype.drawImage;
    CanvasRenderingContext2D.prototype.drawImage = function (
      this: CanvasRenderingContext2D,
      ...args: Parameters<typeof original>
    ) {
      const image = args[0] as HTMLImageElement;
      if (
        image.src?.includes('gilgame-runner-sheet.png') &&
        args.length === 9
      ) {
        target.__gilgameSpriteDraws.push({
          clip: args[2] < 300 ? 'run' : args[2] < 640 ? 'jump' : 'duck',
          frame: args[1] + ':' + args[2],
          y: args[6],
          height: args[8],
        });
      }
      return Reflect.apply(original, this, args);
    } as typeof original;
  });
  await page.goto('/runner-animation-check');
  const count = (clip: string) =>
    page.evaluate(
      (name) =>
        new Set(
          (window as unknown as SpriteWindow).__gilgameSpriteDraws
            .filter((f) => f.clip === name)
            .map((f) => f.frame),
        ).size,
      clip,
    );
  await expect.poll(() => count('run')).toBe(1);
  const game = page.getByRole('region', { name: 'GILGAME RUN' });
  const canvas = page.getByRole('img', { name: 'ギルガメのランニングゲーム' });
  await page
    .getByRole('button', { name: '冒険をはじめる', exact: true })
    .click();
  await expect.poll(() => count('jump')).toBeGreaterThanOrEqual(4);
  await expect.poll(() => count('run')).toBeGreaterThanOrEqual(2);
  await canvas.focus();
  await page.keyboard.down('ArrowDown');
  await expect.poll(() => count('duck')).toBeGreaterThanOrEqual(3);
  await page.getByRole('button', { name: '一時停止', exact: true }).click();
  await expect(game).toHaveAttribute('data-phase', 'paused');
  await page.keyboard.up('ArrowDown');
  const pixels = await canvas.evaluate((node) =>
    (node as HTMLCanvasElement).toDataURL(),
  );
  await page.waitForTimeout(150);
  expect(
    await canvas.evaluate((node) => (node as HTMLCanvasElement).toDataURL()),
  ).toBe(pixels);
  const duckFrames = await page.evaluate(() =>
    (window as unknown as SpriteWindow).__gilgameSpriteDraws.filter(
      (f) => f.clip === 'duck',
    ),
  );
  expect(Math.max(...duckFrames.map((f) => f.height))).toBeLessThan(52);
  await page.screenshot({
    path:
      'test-results/runner-crouch-animation-' + testInfo.project.name + '.png',
    fullPage: true,
  });
  await page
    .getByRole('button', { name: 'つづける', exact: true })
    .first()
    .click();
  await canvas.press('ArrowUp');
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as unknown as SpriteWindow).__gilgameSpriteDraws.at(-1)?.clip,
      ),
    )
    .toBe('jump');
  await canvas.press('Escape');
  await expect(game).toHaveAttribute('data-phase', 'paused');
  await page.screenshot({
    path:
      'test-results/runner-jump-animation-' + testInfo.project.name + '.png',
    fullPage: true,
  });
});
