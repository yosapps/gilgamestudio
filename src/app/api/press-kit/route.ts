import { getGames, getSettings, siteUrl } from '@/lib/data';
import { translator } from '@/lib/translations';
import { localePath } from '@/lib/features';
import { studioBrand } from '@/lib/brand';
export async function GET(request: Request) {
  const locale =
    new URL(request.url).searchParams.get('locale') === 'en' ? 'en' : 'ja';
  const t = translator(locale);
  const [settings, games] = await Promise.all([
    getSettings(),
    getGames(locale),
  ]);
  const lines = [
    settings.site_name,
    siteUrl(),
    '',
    t(settings.description),
    '',
    t(settings.profile),
    '',
    t('素材・配信ガイドライン'),
    (locale === 'en'
      ? settings.press_guidelines_en || settings.press_guidelines
      : settings.press_guidelines) ||
      t('素材の利用・ゲームの配信については、公式Xへお問い合わせください。'),
    '',
    t('取材のお問い合わせ') + ': ' + studioBrand.x.url,
    ...games.flatMap((game) =>
      [
        '',
        '--- ' + game.title + ' ---',
        game.description,
        siteUrl() + localePath('/games/' + game.slug, locale),
        game.cover_url,
        ...game.screenshots,
      ].filter(Boolean),
    ),
  ];
  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition':
        'attachment; filename="gilgame-press-kit-' + locale + '.txt"',
      'Cache-Control': 'public, max-age=60',
    },
  });
}
