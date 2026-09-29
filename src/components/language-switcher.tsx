'use client';
import { useState } from 'react';
import { localeCookie, type Locale } from '@/lib/locale';
import { useLocale } from './language-provider';

export function LanguageSwitcher() {
  const locale = useLocale();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  function select(next: Locale) {
    if (next === locale) return;
    document.cookie = `${localeCookie}=${next}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
    const saved = document.cookie
      .split('; ')
      .some((entry) => entry === `${localeCookie}=${next}`);
    setError(!saved);
    if (saved) {
      setPending(true);
      // Refresh the document and prefetched routes together after changing language.
      window.location.reload();
    }
  }
  return (
    <div className="language-control">
      <div
        className="language-switcher"
        role="group"
        aria-label="Language / 言語"
        aria-busy={pending}
      >
        <button
          type="button"
          lang="ja"
          aria-pressed={locale === 'ja'}
          disabled={pending}
          onClick={() => select('ja')}
        >
          日本語
        </button>
        <button
          type="button"
          lang="en"
          aria-label="English"
          aria-pressed={locale === 'en'}
          disabled={pending}
          onClick={() => select('en')}
        >
          EN
        </button>
      </div>
      {error && (
        <small role="alert">
          {locale === 'ja'
            ? '言語の保存にはCookieを有効にしてください。'
            : 'Enable cookies to save your language.'}
        </small>
      )}
    </div>
  );
}
