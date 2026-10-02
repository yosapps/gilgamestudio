import { test, expect } from '@playwright/test';
test.use({ locale: 'ja-JP' });
test('言語別URLと検索条件、canonical、RSSとプレスキット', async ({
  page,
  request,
}, info) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/en/press');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    /\/en\/press$/,
  );
  await expect(page.locator('link[hreflang="ja"]')).toHaveAttribute(
    'href',
    /\/press$/,
  );
  await expect(
    page.getByRole('heading', { name: 'Logo and character' }),
  ).toBeVisible();
  await page.screenshot({
    path: 'test-results/features/press-' + info.project.name + '.png',
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  await page.getByRole('link', { name: 'Games', exact: true }).first().click();
  await expect(page).toHaveURL(/\/en\/games$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.goto('/en/blog?q=hello#top');
  await page.getByRole('button', { name: '日本語', exact: true }).click();
  await expect(page).toHaveURL(/\/blog\?q=hello#top$/);
  await expect(page.getByLabel('キーワード')).toHaveValue('hello');
  const feed = await request.get('/feed.xml');
  expect(feed.status()).toBe(200);
  expect(feed.headers()['content-type']).toContain('application/rss+xml');
  const xml = await feed.text();
  expect(xml).not.toContain('private-development-note');
  expect(xml).not.toContain('future-release-note');
  const parserErrors = await page.evaluate(
    (source) =>
      new DOMParser()
        .parseFromString(source, 'application/xml')
        .getElementsByTagName('parsererror').length,
    xml,
  );
  expect(parserErrors).toBe(0);
  const kit = await request.get('/api/press-kit?locale=en');
  expect(kit.status()).toBe(200);
  expect(kit.headers()['content-disposition']).toContain('attachment');
  expect(await kit.text()).toContain('Gilgame studio');
  expect([401, 503]).toContain(
    (await request.get('/api/admin/media')).status(),
  );
  expect((await request.get('/en/admin')).status()).toBe(404);
  expect(errors).toEqual([]);
});
test('発見図鑑はページ・言語をまたいで保存される', async ({ page }, info) => {
  await page.goto('/');
  await page
    .getByRole('button', { name: 'ギルガメを見つける', exact: true })
    .click();
  await page.goto('/discover');
  await expect(page.locator('.discovery-progress')).toContainText('1 / 4');
  await page.reload();
  await expect(page.locator('.discovery-progress')).toContainText('1 / 4');
  for (const path of ['/en/games', '/en/blog', '/en/about']) {
    await page.goto(path);
    await page
      .getByRole('button', { name: 'Find Gilgame', exact: true })
      .click();
  }
  await page.goto('/en/discover');
  await expect(page.locator('.discovery-progress')).toContainText('4 / 4');
  await expect(
    page.getByText('You found them all!', { exact: false }),
  ).toBeVisible();
  await page.screenshot({
    path: 'test-results/features/discoveries-' + info.project.name + '.png',
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  await page
    .getByRole('button', { name: 'Reset discoveries', exact: true })
    .click();
  await expect(page.locator('.discovery-progress')).toContainText('0 / 4');
});
test('CMSは下書きを復元し、画像を選択し、翻訳を確認できる', async ({
  page,
}, info) => {
  test.skip(
    !process.env.E2E_CMS_FIXTURE,
    'Requires the isolated scripts/feature-preview.mjs fixture',
  );
  await page.route('**/api/admin/media?*', (route) =>
    route.fulfill({
      json: {
        items: [
          { id: 'image', name: 'Studio Logo', url: '/logo.png', size: 100 },
        ],
        hasMore: false,
      },
    }),
  );
  await page.route('**/api/admin/posts', (route) =>
    route.fulfill({
      json: { ok: true, id: '11111111-1111-4111-8111-111111111111' },
    }),
  );
  page.on('dialog', (dialog) => {
    void dialog.accept();
  });
  await page.goto('/studio-test');
  const title = page.getByLabel('タイトル *', { exact: true });
  await title.fill('Restorable draft');
  await expect(
    page.getByText('このブラウザに自動保存しました', { exact: false }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole('button', { name: '下書きを復元' }),
  ).toBeVisible();
  await page.getByRole('button', { name: '下書きを復元' }).click();
  await expect(title).toHaveValue('Restorable draft');
  await page.getByRole('button', { name: '画像を選ぶ', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: '画像を選択' });
  await expect(dialog).toBeVisible();
  await dialog
    .getByRole('button', { name: 'Studio Logo', exact: true })
    .click();
  await expect(page.getByLabel('カバー画像URL')).toHaveValue('/logo.png');
  await expect(dialog).not.toBeVisible();
  await page.getByRole('button', { name: '変更を保存', exact: true }).click();
  await expect(page.getByText('保存しました', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: '下書きを復元' })).toHaveCount(
    0,
  );
  await page
    .getByRole('button', { name: 'English 要確認', exact: true })
    .click();
  await expect(
    page.getByText('原文が更新されています。', { exact: false }),
  ).toBeVisible();
  await page
    .getByText('日本語の原文を見ながら編集する', { exact: true })
    .click();
  await expect(page.locator('.source-reference')).toHaveAttribute('open', '');
  await page.screenshot({
    path: 'test-results/features/cms-' + info.project.name + '.png',
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
});

test('作品の主要ボタンと開発日誌、英語の未翻訳canonical', async ({
  page,
}, info) => {
  test.skip(
    !process.env.E2E_CMS_FIXTURE,
    'Requires the isolated demo fixtures',
  );
  await page.goto('/games/echoes-of-the-void');
  await expect(
    page.getByRole('link', { name: '体験版を遊ぶ ↗', exact: true }),
  ).toHaveAttribute('href', 'https://example.com/fixture-demo');
  await expect(
    page.getByRole('heading', { name: 'この作品の開発日誌' }),
  ).toBeVisible();
  await page.locator('.post-row').first().click();
  await expect(page.locator('.related-game')).toContainText(
    'ECHOES OF THE VOID',
  );
  await page.locator('.related-game a').click();
  await expect(page).toHaveURL(/\/games\/echoes-of-the-void$/);
  await page
    .getByRole('link', { name: 'この作品の記事をすべて読む →' })
    .click();
  await expect(
    page.getByRole('combobox', { name: '作品', exact: true }),
  ).toHaveValue('echoes-of-the-void');
  await expect(page.locator('.post-row')).toHaveCount(1);
  await page.goto('/en/games/echoes-of-the-void');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    /\/games\/echoes-of-the-void$/,
  );
  await expect(page.locator('link[rel="canonical"]')).not.toHaveAttribute(
    'href',
    /\/en\//,
  );
  await expect(page.locator('link[hreflang="en"]')).toHaveCount(0);
  await page.screenshot({
    path: 'test-results/features/game-' + info.project.name + '.png',
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
});
