import { getLocale, getTranslator } from '@/lib/locale-server';
import type { Metadata } from 'next';
import '@fontsource-variable/space-grotesk';
import '@fontsource/m-plus-rounded-1c/400.css';
import '@fontsource/m-plus-rounded-1c/500.css';
import '@fontsource/m-plus-rounded-1c/700.css';
import '@fontsource/m-plus-rounded-1c/800.css';
import { LanguageProvider } from '@/components/language-provider';
import { getSettings, siteUrl } from '@/lib/data';
import './globals.css';
import { studioBrand } from '@/lib/brand';
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslator();
  const s = await getSettings();
  return {
    metadataBase: new URL(siteUrl()),
    title: {
      default: `${s.site_name} — Independent Game Developer`,
      template: `%s | ${s.site_name}`,
    },
    description: t(s.description),
    openGraph: {
      title: s.site_name,
      description: t(s.description),
      locale: (await getLocale()) === 'ja' ? 'ja_JP' : 'en_US',
      type: 'website',
      images: s.og_image ? [s.og_image] : [],
    },
    twitter: { card: 'summary_large_image', site: studioBrand.x.handle },
    robots: { index: true, follow: true },
  };
}
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslator();
  return (
    <html lang={await getLocale()}>
      <body>
        <a className="skip-link" href="#main">
          {t('本文へ移動')}
        </a>
        <LanguageProvider locale={await getLocale()}>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
