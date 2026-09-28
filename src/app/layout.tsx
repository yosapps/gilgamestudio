import type { Metadata } from 'next';
import '@fontsource-variable/space-grotesk';
import '@fontsource-variable/noto-sans-jp';
import { getSettings, siteUrl } from '@/lib/data';
import './globals.css';
export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    metadataBase: new URL(siteUrl()),
    title: {
      default: `${s.site_name} — Independent Game Developer`,
      template: `%s | ${s.site_name}`,
    },
    description: s.description,
    openGraph: {
      title: s.site_name,
      description: s.description,
      locale: 'ja_JP',
      type: 'website',
      images: s.og_image ? [s.og_image] : [],
    },
    twitter: { card: 'summary_large_image' },
    robots: { index: true, follow: true },
  };
}
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <a className="skip-link" href="#main">
          本文へ移動
        </a>
        {children}
      </body>
    </html>
  );
}
