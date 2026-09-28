import { requireAdmin } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard,
  FileText,
  Gamepad2,
  Images,
  Settings,
  Orbit,
} from 'lucide-react';
import { logout } from '@/app/login/actions';
export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Studio CMS',
  robots: { index: false, follow: false },
};
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link href="/admin" className="brand">
          <Image src="/icon.svg" alt="" width={35} height={35} />{' '}
          <span>
            Gilgame studio<small>CREATOR WORKSPACE</small>
          </span>
        </Link>
        <p>YOUR CREATIVE WORKSPACE</p>
        <nav aria-label="管理ナビゲーション">
          {[
            ['/admin', '概要', LayoutDashboard],
            ['/admin/posts', 'ブログ', FileText],
            ['/admin/games', 'ゲーム', Gamepad2],
            ['/admin/media', 'メディア', Images],
            ['/admin/settings', 'サイト設定', Settings],
          ].map(([href, label, Icon]) => {
            const I = Icon as typeof Orbit;
            return (
              <Link key={String(href)} href={String(href)}>
                <I size={18} />
                {String(label)}
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <Link href="/">公開サイト ↗</Link>
          <form action={logout}>
            <button className="button button-outline">ログアウト</button>
          </form>
        </div>
      </aside>
      <main className="admin-main" id="main">
        {children}
      </main>
    </div>
  );
}
