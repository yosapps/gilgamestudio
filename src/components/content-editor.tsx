'use client';
import { useState } from 'react';
import { ContentForm } from './content-form';
import { TranslationForm } from './translation-form';
import type { Game, Post, GameTranslation, PostTranslation } from '@/lib/types';

export function ContentEditor({
  kind,
  initial,
  translation,
  translationsReady = true,
}: {
  kind: 'posts' | 'games';
  initial?: Post | Game;
  translation?: PostTranslation | GameTranslation;
  translationsReady?: boolean;
}) {
  const [language, setLanguage] = useState<'ja' | 'en'>('ja');
  return (
    <>
      <div
        className="editor-language-bar"
        role="group"
        aria-label="編集する言語"
      >
        <button
          type="button"
          aria-pressed={language === 'ja'}
          onClick={() => setLanguage('ja')}
        >
          日本語・共通設定
        </button>
        <button
          type="button"
          aria-pressed={language === 'en'}
          onClick={() => setLanguage('en')}
        >
          English{' '}
          <span>
            {translation?.is_published
              ? '公開設定済み'
              : translation
                ? '下書き'
                : '未登録'}
          </span>
        </button>
      </div>
      <div hidden={language !== 'ja'}>
        <ContentForm kind={kind} initial={initial} />
      </div>
      <div hidden={language !== 'en'}>
        {!initial?.id ? (
          <p className="notice">
            日本語版を先に保存すると、同じ記事・ゲームの英語版を登録できます。
          </p>
        ) : !translationsReady ? (
          <p role="alert" className="notice error">
            英語テーブルが未作成です。Supabaseで翻訳マイグレーションを実行してください。
          </p>
        ) : (
          <TranslationForm kind={kind} parent={initial} initial={translation} />
        )}
      </div>
    </>
  );
}
