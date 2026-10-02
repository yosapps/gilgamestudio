import { test, expect, type Page } from '@playwright/test';
test.use({ locale: 'ja-JP' });

async function expectNoOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
}

async function openGame(page: Page, href: string) {
  const link = page.locator('a[href="' + href + '"]');
  await expect(link).toHaveAttribute('target', '_blank');
  await expect(link).toHaveAttribute('rel', /noopener/);
  await expect(link).toHaveAttribute('rel', /noreferrer/);
  const [detail] = await Promise.all([
    page.waitForEvent('popup'),
    link.click(),
  ]);
  await detail.waitForLoadState('domcontentloaded');
  await expect(detail).toHaveURL(new RegExp(href + '$'));
  return detail;
}

test('menu opens the catalog and each game opens in its own tab', async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page
    .context()
    .on('page', (detail) =>
      detail.on('pageerror', (error) => errors.push(error.message)),
    );
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  const menu = page.getByRole('navigation', { name: 'メインナビゲーション' });
  const link = menu.getByRole('link', { name: 'Mini games', exact: true });
  await expect(link).toHaveAttribute('href', '/minigames');
  await link.click();
  await expect(page).toHaveURL(/\/minigames$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Mini games.',
  );
  await expect(page).toHaveTitle(/Mini games \| Gilgame studio/);
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.getByTestId('gilgame-stars')).toHaveCount(0);
  await expect(
    page
      .locator('footer')
      .getByRole('link', { name: 'Mini games', exact: true }),
  ).toHaveAttribute('href', '/minigames');
  await expectNoOverflow(page);
  await page.screenshot({
    path: 'test-results/minigames-catalog-' + testInfo.project.name + '.png',
    fullPage: true,
  });
  const runner = await openGame(page, '/minigames/gilgame-runner');
  await expect(page).toHaveURL(/\/minigames$/);
  await expect(
    runner.getByRole('region', { name: 'GILGAME RUN' }),
  ).toHaveAttribute('data-phase', 'ready');
  await expect(
    runner.getByRole('button', { name: '冒険をはじめる', exact: true }),
  ).toBeEnabled();
  await runner.close();
  const stars = await openGame(page, '/minigames/gilgame-stars');
  await expect(page).toHaveURL(/\/minigames$/);
  await expect(stars.getByTestId('gilgame-stars')).toHaveAttribute(
    'data-phase',
    'ready',
  );
  await expect(
    stars.getByRole('button', { name: '星あつめをはじめる', exact: true }),
  ).toBeEnabled();
  await expectNoOverflow(stars);
  await stars.close();
  expect(errors).toEqual([]);
});

test('runner detail starts, pauses, resumes, and shares the 404 best score', async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    if (!localStorage.getItem('gilgame:runner:best:v1'))
      localStorage.setItem('gilgame:runner:best:v1', '42');
  });
  await page.goto('/minigames/gilgame-runner');
  const game = page.getByRole('region', { name: 'GILGAME RUN' });
  await expect(page.getByLabel('自己ベスト', { exact: true })).toHaveText(
    '00042',
  );
  await expect(
    game.getByText('ギルガメと、ひと走り。', { exact: true }),
  ).toBeVisible();
  await expectNoOverflow(page);
  await page.screenshot({
    path:
      'test-results/minigames-runner-ready-' + testInfo.project.name + '.png',
    fullPage: true,
  });
  await game
    .getByRole('button', { name: '冒険をはじめる', exact: true })
    .click();
  await expect(game).toHaveAttribute('data-phase', 'running');
  await game.getByRole('button', { name: '一時停止', exact: true }).click();
  await expect(game).toHaveAttribute('data-phase', 'paused');
  await game
    .getByRole('button', { name: 'つづける', exact: true })
    .first()
    .click();
  await expect(game).toHaveAttribute('data-phase', 'running');
  await page.goto('/minigames-does-not-exist');
  await expect(page.getByLabel('自己ベスト', { exact: true })).toHaveText(
    '00042',
  );
  await page.getByRole('link', { name: /^ミニゲームで遊ぶ/ }).click();
  await expect(page).toHaveURL(/\/minigames$/);
  const runner = await openGame(page, '/minigames/gilgame-runner');
  await expect(runner.getByLabel('自己ベスト', { exact: true })).toHaveText(
    '00042',
  );
  await runner.close();
  expect(errors).toEqual([]);
});

test('star catching supports touch lanes, keyboard movement, and pausing progress', async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/minigames/gilgame-stars');
  const game = page.getByTestId('gilgame-stars');
  const left = game.getByRole('button', {
    name: 'ギルガメを左に移動',
    exact: true,
  });
  const center = game.getByRole('button', {
    name: 'ギルガメを中央に移動',
    exact: true,
  });
  const right = game.getByRole('button', {
    name: 'ギルガメを右に移動',
    exact: true,
  });
  await expect(game).toHaveAttribute('data-phase', 'ready');
  await expect(left).toBeDisabled();
  await game
    .getByRole('button', { name: '星あつめをはじめる', exact: true })
    .click();
  await expect(game).toHaveAttribute('data-phase', 'running');
  await expect(game).toHaveAttribute('data-lane', '1');
  if (testInfo.project.name === 'mobile') await left.tap();
  else await left.click();
  await expect(game).toHaveAttribute('data-lane', '0');
  await right.click();
  await expect(game).toHaveAttribute('data-lane', '2');
  await center.click();
  await expect(game).toHaveAttribute('data-lane', '1');
  await game.focus();
  await game.press('ArrowLeft');
  await expect(game).toHaveAttribute('data-lane', '0');
  await game.press('ArrowRight');
  await expect(game).toHaveAttribute('data-lane', '1');
  await game.press('Escape');
  await expect(game).toHaveAttribute('data-phase', 'paused');
  await expect(left).toBeDisabled();
  const pausedTime = await game.getByTestId('stars-time').innerText();
  const pausedScore = await game.getByTestId('stars-score').innerText();
  await page.waitForTimeout(250);
  await expect(game.getByTestId('stars-time')).toHaveText(pausedTime);
  await expect(game.getByTestId('stars-score')).toHaveText(pausedScore);
  await game
    .getByRole('button', { name: 'つづける', exact: true })
    .first()
    .click();
  await expect(game).toHaveAttribute('data-phase', 'running');
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await expect(game).toHaveAttribute('data-phase', 'paused');
  await game.focus();
  await game.press('p');
  await expect(game).toHaveAttribute('data-phase', 'running');
  await game.press('p');
  await expect(game).toHaveAttribute('data-phase', 'paused');
  if (testInfo.project.name === 'mobile')
    await page.setViewportSize({ width: 320, height: 800 });
  await expectNoOverflow(page);
  await page.screenshot({
    path:
      'test-results/minigames-stars-paused-' + testInfo.project.name + '.png',
    fullPage: true,
  });
  expect(errors).toEqual([]);
});

test('star catching awards points, finishes, retries, and keeps an independent best score', async ({
  page,
}) => {
  await page.clock.install();
  await page.addInitScript(() =>
    localStorage.setItem('gilgame:runner:best:v1', '42'),
  );
  await page.goto('/minigames/gilgame-stars');
  const game = page.getByTestId('gilgame-stars');
  await game
    .getByRole('button', { name: '星あつめをはじめる', exact: true })
    .click();
  await page.clock.runFor(4000);
  await expect(game.getByTestId('stars-score')).not.toHaveText(/^0+$/);
  await page.clock.runFor(25000);
  await expect(game).toHaveAttribute('data-phase', 'running');
  await page.clock.runFor(2000);
  await expect(game).toHaveAttribute('data-phase', 'over');
  const finalScore = Number(await game.getByTestId('stars-score').innerText());
  expect(finalScore).toBeGreaterThanOrEqual(10);
  expect(
    await page.evaluate(() => localStorage.getItem('gilgame:stars:best:v1')),
  ).toBe(String(finalScore));
  expect(
    await page.evaluate(() => localStorage.getItem('gilgame:runner:best:v1')),
  ).toBe('42');
  await game
    .getByRole('button', { name: 'もう一度あそぶ', exact: true })
    .click();
  await expect(game).toHaveAttribute('data-phase', 'running');
  await expect(game.getByTestId('stars-score')).toHaveText(/^0+$/);
  await game.getByRole('button', { name: '一時停止', exact: true }).click();
  await page.reload();
  await expect(game.getByTestId('stars-best')).toHaveText(
    new RegExp('^0*' + finalScore + '$'),
  );
});

test('English catalog and details retain localized URLs, navigation, language switching, and SEO', async ({
  page,
  request,
}, testInfo) => {
  const response = await page.goto('/en/minigames');
  expect(response?.status()).toBe(200);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Mini games.',
  );
  await expect(page).toHaveTitle(/Mini games \| Gilgame studio/);
  const menu = page.getByRole('navigation', { name: 'Main navigation' });
  await expect(
    menu.getByRole('link', { name: 'Mini games', exact: true }),
  ).toHaveAttribute('href', '/en/minigames');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    /\/en\/minigames$/,
  );
  for (const slug of ['gilgame-runner', 'gilgame-stars']) {
    const detail = await openGame(page, '/en/minigames/' + slug);
    await expect(page).toHaveURL(/\/en\/minigames$/);
    await expect(detail.locator('html')).toHaveAttribute('lang', 'en');
    await expect(detail.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      new RegExp('/en/minigames/' + slug + '$'),
    );
    await expect(detail.locator('link[hreflang="ja"]')).toHaveAttribute(
      'href',
      new RegExp('(?<!en)/minigames/' + slug + '$'),
    );
    await expect(detail.locator('link[hreflang="en"]')).toHaveAttribute(
      'href',
      new RegExp('/en/minigames/' + slug + '$'),
    );
    await expect(
      detail.getByRole('button', {
        name:
          slug === 'gilgame-runner'
            ? 'Start running'
            : 'Start collecting stars',
        exact: true,
      }),
    ).toBeEnabled();
    await expect(
      detail.getByRole('heading', { name: 'How to play' }),
    ).toBeVisible();
    await expectNoOverflow(detail);
    await detail.getByRole('button', { name: '日本語', exact: true }).click();
    await expect(detail).toHaveURL(
      new RegExp('(?<!en)/minigames/' + slug + '$'),
    );
    await expect(detail.locator('html')).toHaveAttribute('lang', 'ja');
    await detail.getByRole('button', { name: 'English', exact: true }).click();
    await expect(detail).toHaveURL(new RegExp('/en/minigames/' + slug + '$'));
    await detail.close();
  }
  const paths = [
    '/minigames',
    '/minigames/gilgame-runner',
    '/minigames/gilgame-stars',
  ];
  for (const path of paths) {
    const alias = await request.get('/ja' + path, { maxRedirects: 0 });
    expect(alias.status()).toBe(308);
    expect(alias.headers().location).toMatch(
      new RegExp('(?<!en)' + path + '$'),
    );
  }
  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.status()).toBe(200);
  const xml = await sitemap.text();
  for (const path of paths) {
    expect(xml).toMatch(new RegExp('<loc>[^<]*' + path + '</loc>'));
    expect(xml).toMatch(new RegExp('<loc>[^<]*/en' + path + '</loc>'));
  }
  if (testInfo.project.name === 'mobile') {
    await page.setViewportSize({ width: 320, height: 800 });
    await expect(
      menu.getByRole('link', { name: 'Mini games', exact: true }),
    ).toBeVisible();
  }
  await expectNoOverflow(page);
  await page.screenshot({
    path: 'test-results/minigames-en-' + testInfo.project.name + '.png',
    fullPage: true,
  });
});

test('English star catching works when browser storage is disabled', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new Error('Storage disabled');
    };
    Storage.prototype.setItem = () => {
      throw new Error('Storage disabled');
    };
  });
  await page.clock.install();
  await page.goto('/en/minigames/gilgame-stars');
  const game = page.getByTestId('gilgame-stars');
  await game
    .getByRole('button', { name: 'Start collecting stars', exact: true })
    .click();
  await expect(game).toHaveAttribute('data-phase', 'running');
  await page.clock.runFor(3000);
  await expect(game.getByTestId('stars-score')).toHaveText('10');
  await game
    .getByRole('button', { name: 'Move Gilgame left', exact: true })
    .click();
  await expect(game).toHaveAttribute('data-lane', '0');
  await game.getByRole('button', { name: 'Pause', exact: true }).click();
  await expect(game).toHaveAttribute('data-phase', 'paused');
  expect(errors).toEqual([]);
});

test('unknown mini game detail URLs return the localized 404 page', async ({
  page,
}) => {
  for (const prefix of ['', '/en']) {
    const response = await page.goto(prefix + '/minigames/unknown-game');
    expect(response?.status()).toBe(404);
    await expect(page.locator('html')).toHaveAttribute(
      'lang',
      prefix ? 'en' : 'ja',
    );
    await expect(page.getByTestId('gilgame-stars')).toHaveCount(0);
    await expect(
      page.getByRole('region', { name: 'GILGAME RUN' }),
    ).toBeVisible();
  }
});
