'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Button } from './ui/button';
import type {
  Game,
  Post,
  GameTranslation,
  PostTranslation,
  RichNode,
} from '@/lib/types';

const Editor = dynamic(() => import('./editor'), {
  ssr: false,
  loading: () => <div className="skeleton" style={{ height: 380 }} />,
});
type Fields = Record<string, string>;
const list = (value = '') =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

export function TranslationForm({
  kind,
  parent,
  initial,
}: {
  kind: 'posts' | 'games';
  parent: Post | Game;
  initial?: PostTranslation | GameTranslation;
}) {
  const defaults: Fields = {
    publication: initial?.is_published ? 'published' : 'draft',
  };
  for (const [key, value] of Object.entries(initial || {})) {
    if (typeof value === 'string') defaults[key] = value;
    else if (Array.isArray(value))
      defaults[key] =
        key === 'external_links'
          ? value.map((link) => `${link.label} | ${link.url}`).join('\n')
          : value.join(', ');
  }
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Fields>({ defaultValues: defaults });
  const [content, setContent] = useState<RichNode>(
    kind === 'posts' && initial
      ? (initial as PostTranslation).content
      : { type: 'doc', content: [{ type: 'paragraph' }] },
  );
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const submit = handleSubmit(async (values) => {
    setPending(true);
    setMessage('');
    setSuccess(false);
    const common = {
      locale: 'en',
      title: values.title || '',
      tags: list(values.tags),
      is_published: values.publication === 'published',
    };
    const data =
      kind === 'posts'
        ? {
            ...common,
            excerpt: values.excerpt || '',
            content,
            category: values.category || '',
            seo_title: values.seo_title || '',
            seo_description: values.seo_description || '',
          }
        : {
            ...common,
            description: values.description || '',
            body: values.body || '',
            genre: values.genre || '',
            external_links: (values.external_links || '')
              .split('\n')
              .filter((line) => line.trim())
              .map((line) => {
                const [label, ...url] = line.split('|');
                return { label: label.trim(), url: url.join('|').trim() };
              }),
          };
    try {
      const response = await fetch(
        `/api/admin/${kind === 'posts' ? 'post-translations' : 'game-translations'}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: parent.id, data }),
        },
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || '英語版を保存できませんでした。');
      setSuccess(true);
      setMessage('英語版を保存しました。');
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : '通信に失敗しました。',
      );
    } finally {
      setPending(false);
    }
  });
  function field(name: string, label: string, area = false, required = false) {
    return (
      <label key={name}>
        {label}
        {required && ' *'}
        {area ? (
          <textarea
            lang="en"
            {...register(name, {
              required: required ? '入力してください' : false,
            })}
          />
        ) : (
          <input
            lang="en"
            {...register(name, {
              required: required ? '入力してください' : false,
            })}
          />
        )}
        {errors[name] && (
          <span className="field-error">{errors[name]?.message}</span>
        )}
      </label>
    );
  }
  return (
    <form className="admin-form form-stack" onSubmit={submit}>
      <section className="admin-panel form-stack">
        <h2>English version</h2>
        <p className="muted">
          元のコンテンツ：{parent.title}
          <br />
          URL・画像・公開日時・開発状況は日本語版と共通です。英語版が下書き・未登録の場合は、日本語の原文を表示します。
        </p>
        {field('title', 'タイトル（英語）', false, true)}
        {field(
          kind === 'posts' ? 'excerpt' : 'description',
          '概要（英語）',
          true,
        )}
        <label>
          英語版の公開設定
          <select {...register('publication')}>
            <option value="draft">下書き</option>
            <option value="published">公開</option>
          </select>
          <span className="muted">
            元の記事・ゲームが公開されている場合にのみ、英語版も表示されます。予約記事は公開日時に従います。
          </span>
        </label>
      </section>
      <section className="admin-panel form-stack">
        {kind === 'posts' ? (
          <>
            <h2>本文（英語）</h2>
            <div lang="en">
              <Editor value={content} onChange={setContent} />
            </div>
          </>
        ) : (
          field('body', 'ゲーム紹介（英語）', true)
        )}
      </section>
      <section className="admin-panel form-stack">
        {field(
          kind === 'posts' ? 'category' : 'genre',
          kind === 'posts' ? 'カテゴリ（英語）' : 'ジャンル（英語）',
        )}
        {field('tags', 'タグ（英語・カンマ区切り）')}
        <p className="muted">
          タグは日本語版と同じ順序で入力すると、言語を切り替えても同じタグで絞り込めます。
        </p>
        {kind === 'posts' ? (
          <>
            {field('seo_title', 'SEOタイトル（英語）')}
            {field('seo_description', 'SEO説明（英語）', true)}
          </>
        ) : (
          <>
            {field('external_links', '外部リンク（英語）', true)}
            <p className="muted">
              1行に「Steam |
              https://...」の形式で入力。空欄なら日本語版のリンクを使用します。
            </p>
          </>
        )}
      </section>
      <div className="admin-actions">
        <Button type="submit" disabled={pending}>
          {pending ? '保存中…' : '英語版を保存'}
        </Button>
        {message && (
          <p
            role={success ? 'status' : 'alert'}
            className={`notice ${success ? 'success' : 'error'}`}
          >
            {message}
          </p>
        )}
      </div>
    </form>
  );
}
