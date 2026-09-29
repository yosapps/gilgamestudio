import { test, expect } from '@playwright/test';

test.use({ locale: 'en-US' });

test('browser language, manual selection, persistence and translated public pages', async ({
  page,
}, testInfo) => {
  test.setTimeout(90000);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('h1')).toContainText('From small steps,');
  await expect(page.locator('.character-hello')).toContainText(
    'Hi, I’m Gilgame!',
  );
  await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute(
    'content',
    'en_US',
  );
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: `test-results/language-home-en-${testInfo.project.name}.png`,
  });

  for (const path of ['/games', '/blog', '/about', '/contact']) {
    await page.goto(path);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    // CMS text without a published translation intentionally stays original.
    const copy = await page.locator('.page-intro').innerText();
    expect(copy).not.toMatch(/[\u3040-\u30ff\u3400-\u9fff]/);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `test-results/language-${path.slice(1)}-en-${testInfo.project.name}.png`,
      fullPage: true,
    });
  }
  await page.goto('/blog?q=hello');
  await page.getByRole('button', { name: '日本語', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
  await expect(page).toHaveURL(/\/blog\?q=hello$/);
  await expect(page.getByLabel('キーワード')).toHaveValue('hello');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
  await page
    .getByRole('link', { name: 'Contact', exact: true })
    .first()
    .click();
  await expect(
    page.getByRole('heading', { name: 'お問い合わせは、XのDMへ。' }),
  ).toBeVisible();
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  expect(
    await page.evaluate(() =>
      document.fonts.check('800 20px "M PLUS Rounded 1c"', '冒険'),
    ),
  ).toBe(true);
  await page.screenshot({
    path: `test-results/language-home-ja-${testInfo.project.name}.png`,
  });
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('h1')).toContainText('From small steps,');
  expect(errors).toEqual([]);
});

test('English launch article is served from CMS', async ({ page }) => {
  await page.goto('/blog/official-website-launch');
  await expect(page.locator('h1')).toContainText(
    'Welcome to the official Gilgame studio website',
  );
  expect(await page.locator('main').innerText()).not.toMatch(
    /[\u3040-\u30ff\u3400-\u9fff]/,
  );
  await page.goto('/blog');
  await page.getByLabel('Keyword').fill('Welcome');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await expect(page.locator('.post-row')).toHaveCount(1);
  await page.getByLabel('Category').selectOption({ label: 'News' });
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await page.getByRole('button', { name: '日本語', exact: true }).click();
  await expect(page.locator('.post-row')).toHaveCount(0); // English keyword is preserved.
  await page.getByLabel('キーワード').fill('');
  await page.getByRole('button', { name: '検索', exact: true }).click();
  await expect(page.locator('.post-row')).toHaveCount(1); // Same category across languages.
  await expect(page.locator('.post-row h3')).toContainText(
    '公式サイトを公開しました',
  );
});

test('Japanese browser receives Japanese on first visit', async ({
  browser,
}) => {
  const context = await browser.newContext({ locale: 'ja-JP' });
  const page = await context.newPage();
  await page.goto(`${process.env.E2E_BASE_URL || 'http://localhost:3000'}/`);
  await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
  await expect(page.locator('h1')).toContainText('小さな一歩から、');
  await context.close();
});
