'use client';
import { useHydrated } from './use-hydrated';
import { useState, useSyncExternalStore } from 'react';
import Image from 'next/image';
import Link from './localized-link';
import { useTranslator } from './language-provider';
import { discoveries, parseDiscoveries } from '@/lib/discoveries';
const storageKey = 'gilgame:discoveries:v1';
const eventName = 'gilgame-discoveries';
function snapshot() {
  try {
    return localStorage.getItem(storageKey) || '[]';
  } catch {
    return '[]';
  }
}
function subscribe(listener: () => void) {
  window.addEventListener('storage', listener);
  window.addEventListener(eventName, listener);
  return () => {
    window.removeEventListener('storage', listener);
    window.removeEventListener(eventName, listener);
  };
}
function useDiscoveries() {
  return parseDiscoveries(
    useSyncExternalStore(subscribe, snapshot, () => '[]'),
  );
}
export function GilgameHunt({
  id,
}: {
  id: (typeof discoveries)[number]['id'];
}) {
  const t = useTranslator();
  const hydrated = useHydrated();
  const found = useDiscoveries();
  const [notice, setNotice] = useState('');
  function find() {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify([...new Set([...parseDiscoveries(snapshot()), id])]),
      );
      window.dispatchEvent(new Event(eventName));
      setNotice(t('ギルガメを見つけました！'));
    } catch {
      setNotice(
        t('発見を保存するにはブラウザの保存機能を有効にしてください。'),
      );
    }
  }
  return (
    <div className="gilgame-hunt">
      <button
        type="button"
        className="hunt-button"
        aria-label={t(
          found.includes(id) ? '発見済みのギルガメ' : 'ギルガメを見つける',
        )}
        onClick={find}
        disabled={!hydrated || found.includes(id)}
      >
        <Image src="/gilgame-sit.png" alt="" width={64} height={64} />
        <span>{t(found.includes(id) ? 'みつけた！' : '小さな足あと…')}</span>
      </button>
      {notice && <p role="status">{notice}</p>}
      {found.includes(id) && (
        <Link href="/discover" className="text-link">
          {t('ギルガメの図鑑')} · {found.length}/{discoveries.length} →
        </Link>
      )}
    </div>
  );
}
export function DiscoveryCollection() {
  const t = useTranslator();
  const found = useDiscoveries();
  const [notice, setNotice] = useState('');
  function reset() {
    try {
      localStorage.removeItem(storageKey);
      window.dispatchEvent(new Event(eventName));
      setNotice(t('図鑑をリセットしました。'));
    } catch {
      setNotice(t('図鑑をリセットできませんでした。'));
    }
  }
  return (
    <>
      <p className="discovery-progress" role="status">
        {t('見つけたギルガメ')} {found.length} / {discoveries.length}
      </p>
      <div className="discovery-grid">
        {discoveries.map((item) => {
          const unlocked = found.includes(item.id);
          return (
            <article
              className={'discovery-card ' + (unlocked ? 'unlocked' : 'locked')}
              key={item.id}
            >
              <div>
                {unlocked ? (
                  <Image
                    src={
                      item.id === 'about' ? '/gilgame.png' : '/gilgame-sit.png'
                    }
                    alt={t(item.name)}
                    width={160}
                    height={160}
                  />
                ) : (
                  <span className="discovery-question" aria-hidden="true">
                    ?
                  </span>
                )}
              </div>
              <h2>
                {unlocked ? t(item.name) : t('まだ見つけていないギルガメ')}
              </h2>
              <p>
                {unlocked
                  ? t(item.detail)
                  : t('ページのどこかに、小さな足あと。')}
              </p>
              <Link className="text-link" href={item.path}>
                {t(unlocked ? 'もう一度訪れる' : '探しにいく')} →
              </Link>
            </article>
          );
        })}
      </div>
      {found.length === discoveries.length && (
        <p className="notice success">
          {t('全部見つけました！ギルガメと一緒に、次の冒険へ。')}
        </p>
      )}
      <p className="muted">{t('図鑑はこのブラウザに保存されます。')}</p>
      <button
        type="button"
        className="button button-ghost"
        disabled={!found.length}
        onClick={reset}
      >
        {t('図鑑をリセット')}
      </button>
      {notice && <p role="status">{notice}</p>}
    </>
  );
}
