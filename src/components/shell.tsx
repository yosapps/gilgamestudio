import { messages } from '@/lib/i18n';
import Link from 'next/link';
import { ArrowUpRight, ArrowRight, Gem } from 'lucide-react';
import Image from 'next/image';
import { getSettings } from '@/lib/data';
import { configured } from '@/lib/supabase';
export async function Header() {
  const settings = await getSettings();
  return (
    <header className="site-header">
      <Link
        className="brand"
        href="/"
        aria-label={`${settings.site_name} ホーム`}
      >
        <Image
          className="brand-logo"
          src="/logo.png"
          width={78}
          height={78}
          alt=""
          priority
        />
        <span>
          {settings.site_name}
          <small>SMALL STEPS. SPARKLING ADVENTURES.</small>
        </span>
      </Link>
      <nav aria-label="メインナビゲーション">
        <Link href="/games">{messages.navigation.games}</Link>
        <Link href="/blog">{messages.navigation.journal}</Link>
        <Link href="/about">{messages.navigation.about}</Link>
        <Link className="nav-contact" href="/contact">
          Contact <ArrowUpRight size={15} />
        </Link>
      </nav>
    </header>
  );
}
export async function Footer() {
  const s = await getSettings();
  return (
    <footer className="footer">
      <div>
        <Link className="brand" href="/">
          <Image
            className="brand-logo"
            src="/logo.png"
            width={78}
            height={78}
            alt=""
          />
          {s.site_name}
        </Link>
        <p>{messages.footer}</p>
      </div>
      <div className="footer-links">
        <Link href="/games">{messages.navigation.games}</Link>
        <Link href="/blog">{messages.navigation.journal}</Link>
        <Link href="/about">{messages.navigation.about}</Link>
        <Link href="/contact">{messages.navigation.contact}</Link>
        {s.social_links.map((l) => (
          <a
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            key={l.label}
          >
            {l.label}
            <ArrowUpRight size={14} />
          </a>
        ))}
      </div>
      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} {s.site_name}
        </span>
        <span>ONE LITTLE ADVENTURE AT A TIME.</span>
        <Link href="/login">管理者ログイン</Link>
      </div>
      {!configured() && (
        <p className="demo-notice">
          DEMO MODE — 掲載作品・記事はサンプルです。Supabase未接続。
        </p>
      )}
    </footer>
  );
}
export function SectionTitle({
  index,
  label,
  title,
  href,
  linkText,
}: {
  index: string;
  label: string;
  title: string;
  href?: string;
  linkText?: string;
}) {
  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow">
          <span>{index}</span> {label}
        </p>
        <h2>{title}</h2>
      </div>
      {href && (
        <Link className="text-link" href={href}>
          {linkText}
          <ArrowUpRight size={18} />
        </Link>
      )}
    </div>
  );
}
export function ContactCTA() {
  return (
    <section className="contact-cta">
      <p className="eyebrow">
        <Gem size={16} /> SAY HELLO, START SOMETHING
      </p>
      <h2>
        「楽しそう！」を、
        <br />
        一緒につくろう。
      </h2>
      <Link href="/contact" className="button button-primary">
        お問い合わせ
        <ArrowRight size={18} />
      </Link>
    </section>
  );
}
