import { test, expect } from '@playwright/test';
test.use({ locale: 'ja-JP' });

test('ブランドと作品への導線・記事検索', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    '小さな一歩から、',
  );
  await expect(page.locator('.hero-character')).toBeVisible();
  expect(
    await page
      .locator('.hero-character')
      .evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0),
  ).toBe(true);
  await expect(page.locator('.hero-art canvas')).toBeVisible({
    timeout: 30000,
  });
  await page.getByRole('link', { name: 'ゲームを探索する' }).click();
  await expect(page).toHaveURL(/\/games$/);
  await page.getByRole('button', { name: '絞り込む' }).click();
  await expect(page.locator('h1')).toContainText('Games');
  await expect(page.locator('.game-card, .coming-soon').first()).toBeVisible();
  await page.goto('/blog');
  await page.getByLabel('キーワード').fill('no-matching-post-9f3a2c');
  await page.getByRole('button', { name: '検索', exact: true }).click();
  await expect(page).toHaveURL(/q=no-matching-post-9f3a2c/);
  await expect(
    page.locator('.empty-state, .journal-empty').first(),
  ).toBeVisible();
});

test('未認証の管理画面はログインへ転送される', async ({ page }) => {
  await page.goto('/admin/posts/new');
  await expect(page).toHaveURL(/\/login/);
  const button = page.getByRole('button', { name: 'ログイン', exact: true });
  await expect(button).toBeVisible();
  if (await page.getByText('Supabase未設定です。', { exact: false }).count()) {
    await expect(button).toBeDisabled();
  } else {
    await expect(button).toBeEnabled();
  }
});

test('モーション抑制でも画像と本文を表示し横にはみ出さない', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const path of ['/', '/games', '/blog', '/about', '/contact', '/login']) {
    await page.goto(path);
    await expect(page.locator('h1')).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 1,
      ),
    ).toBe(true);
    if (path === '/')
      await expect(page.locator('.hero-character')).toBeVisible();
  }
});

test('不存在URLは404、ブランドのSEOとアイコンを配信', async ({
  page,
  request,
}) => {
  expect((await request.get('/games/missing-slug')).status()).toBe(404);
  expect((await request.get('/blog/private-development-note')).status()).toBe(
    404,
  );
  await page.goto('/');
  await expect(page).toHaveTitle(/Gilgame studio/);
  await expect(
    page.locator('meta[property="og:image"]').first(),
  ).toHaveAttribute('content', /\/logo.png$/);
  const icon = await request.get('/icon.svg');
  expect(icon.status()).toBe(200);
  expect(await icon.text()).toContain('Gilgame studio crystal');
});
