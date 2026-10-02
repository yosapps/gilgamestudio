'use client';
import { useHydrated } from './use-hydrated';
import { useForm, useWatch } from 'react-hook-form';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { MediaPicker } from './media-picker';
import { useFormDraft, DraftNotice } from './use-form-draft';
import { DeleteDialog } from './delete-dialog';
import type { DraftData } from '@/lib/drafts';
import type { Post, Game, Settings, RichNode } from '@/lib/types';
const Editor = dynamic(() => import('./editor'), {
  ssr: false,
  loading: () => <div className="skeleton" style={{ height: 380 }} />,
});
type Fields = Record<string, string>;
function localDate(v: string | null | undefined) {
  if (!v) return '';
  const d = new Date(v);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}
export function ContentForm({
  kind,
  initial,
  games = [],
  draftScope,
}: {
  kind: 'posts' | 'games' | 'settings';
  initial?: Post | Game | Settings;
  games?: Pick<Game, 'id' | 'title'>[];
  draftScope: string;
}) {
  const hydrated = useHydrated();
  const source = initial as unknown as Record<string, unknown> | undefined;
  const values: Fields = {};
  for (const [k, v] of Object.entries(source || {})) {
    if (Array.isArray(v))
      values[k] = v
        .map((x) => (typeof x === 'string' ? x : `${x.label} | ${x.url}`))
        .join(
          ['screenshots', 'external_links', 'social_links'].includes(k)
            ? '\n'
            : ', ',
        );
    else if (typeof v === 'string') values[k] = v;
    else if (typeof v === 'number') values[k] = String(v);
  }
  values.published_at = localDate(source?.published_at as string);
  const {
    register,
    control,
    getValues,
    setValue,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<Fields>({
    defaultValues: {
      status: 'draft',
      development_status: '開発中',
      sort_order: '0',
      ...values,
    },
  });
  const [content, setContent] = useState<RichNode>(
    (source?.content as RichNode) || {
      type: 'doc',
      content: [{ type: 'paragraph' }],
    },
  );
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [id, setId] = useState<string | number | undefined>(
    source?.id as string | number | undefined,
  );
  const router = useRouter();
  const watched = useWatch({ control }) as Fields;
  const baseUpdatedAt =
    typeof source?.updated_at === 'string' ? source.updated_at : '';
  const draft = useFormDraft(
    'gilgame:draft:' +
      draftScope +
      ':' +
      kind +
      ':' +
      (source?.id || 'new') +
      ':ja',
    { fields: watched, content },
    baseUpdatedAt,
    (data) => {
      reset(data.fields);
      setContent(data.content);
    },
  );
  const csv = (s: string) =>
    s
      ? s
          .split(',')
          .map((v) => v.trim())
          .filter(Boolean)
      : [];
  const lines = (s: string) =>
    s
      ? s
          .split('\n')
          .map((v) => v.trim())
          .filter(Boolean)
      : [];
  const links = (s: string) =>
    lines(s).map((v) => {
      const [label, ...url] = v.split('|');
      return { label: label.trim(), url: url.join('|').trim() };
    });
  async function request(body: unknown, saved?: DraftData) {
    const submittedAt = draft.beginSave();
    setPending(true);
    setMessage('');
    setSuccess(false);
    try {
      const res = await fetch(`/api/admin/${kind}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || '保存できませんでした');
      if ((body as { action?: string }).action === 'delete') draft.discard();
      else
        draft.markSaved(saved || { fields: getValues(), content }, submittedAt);
      setSuccess(true);
      setMessage('保存しました');
      if (result.id && !id) {
        setId(result.id);
        router.replace(`/admin/${kind}/${result.id}/edit`);
      }
      router.refresh();
      return true;
    } catch (e) {
      setMessage(e instanceof Error ? e.message : '通信に失敗しました');
      return false;
    } finally {
      setPending(false);
    }
  }
  const submit = handleSubmit(async (f) => {
    let data: Record<string, unknown>;
    if (kind === 'settings')
      data = {
        site_name: f.site_name || '',
        description: f.description || '',
        profile: f.profile || '',
        og_image: f.og_image || '',
        social_links: links(f.social_links),
        press_guidelines: f.press_guidelines || '',
        press_guidelines_en: f.press_guidelines_en || '',
      };
    else if (kind === 'posts')
      data = {
        game_id: f.game_id || null,
        title: f.title || '',
        slug: f.slug || '',
        excerpt: f.excerpt || '',
        cover_url: f.cover_url || '',
        category: f.category || '',
        tags: csv(f.tags),
        status: f.status,
        content,
        published_at: f.published_at
          ? new Date(f.published_at).toISOString()
          : null,
        seo_title: f.seo_title || '',
        seo_description: f.seo_description || '',
      };
    else
      data = {
        primary_action: f.primary_action || 'auto',
        primary_url: f.primary_url || '',
        title: f.title || '',
        slug: f.slug || '',
        description: f.description || '',
        body: f.body || '',
        cover_url: f.cover_url || '',
        genre: f.genre || '',
        development_status: f.development_status,
        status: f.status,
        sort_order: Number(f.sort_order),
        release_date: f.release_date || null,
        tags: csv(f.tags),
        technologies: csv(f.technologies),
        screenshots: lines(f.screenshots),
        trailer_url: f.trailer_url || '',
        external_links: links(f.external_links),
      };
    await request({ id, data }, { fields: f, content });
  });
  function field(
    name: string,
    label: string,
    options: {
      area?: boolean;
      required?: boolean;
      type?: string;
      hint?: string;
    } = {},
  ) {
    return (
      <label key={name}>
        {label}
        {options.required && ' *'}
        {options.area ? (
          <textarea
            disabled={!hydrated}
            {...register(name, {
              required: options.required ? '入力してください' : false,
            })}
          />
        ) : (
          <input
            disabled={!hydrated}
            type={options.type || 'text'}
            {...register(name, {
              required: options.required ? '入力してください' : false,
            })}
          />
        )}
        {options.hint && <span className="muted">{options.hint}</span>}
        {errors[name] && <p className="field-error">{errors[name]?.message}</p>}
      </label>
    );
  }
  return (
    <form onSubmit={submit} className="admin-form form-stack">
      <DraftNotice draft={draft} baseUpdatedAt={baseUpdatedAt} />
      {kind === 'settings' ? (
        <section className="admin-panel form-stack">
          {field('site_name', 'サイト名', { required: true })}
          {field('description', 'サイト説明', { area: true })}
          {field('profile', 'プロフィール', { area: true })}
          {field('og_image', 'OG画像URL')}
          <MediaPicker
            onSelect={(url) => setValue('og_image', url, { shouldDirty: true })}
          />
          {field('press_guidelines', '素材・配信ガイドライン（日本語）', {
            area: true,
          })}
          {field('press_guidelines_en', '素材・配信ガイドライン（英語）', {
            area: true,
          })}
          {field('social_links', 'SNSリンク', {
            area: true,
            hint: '1行に「GitHub | https://github.com/ユーザー名」の形式で入力',
          })}
        </section>
      ) : (
        <>
          <section className="admin-panel form-stack">
            <div className="form-grid">
              {field('title', 'タイトル', { required: true })}
              {field('slug', 'スラッグ', {
                required: true,
                hint: '半角英数字・ハイフン',
              })}
            </div>
            {field(kind === 'posts' ? 'excerpt' : 'description', '概要', {
              area: true,
            })}
            {field('cover_url', 'カバー画像URL', {
              hint: '画像を選ぶボタンで設定できます。URLの直接入力も利用できます。',
            })}
            <MediaPicker
              onSelect={(url) =>
                setValue('cover_url', url, { shouldDirty: true })
              }
            />
            {kind === 'posts' && (
              <label>
                関連するゲーム
                <select disabled={!hydrated} {...register('game_id')}>
                  <option value="">スタジオ全体のお知らせ</option>
                  {games.map((game) => (
                    <option key={game.id} value={game.id}>
                      {game.title}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <div className="form-grid">
              <label>
                公開状態
                <select {...register('status')}>
                  <option value="draft">下書き</option>
                  <option value="published">公開</option>
                  {kind === 'posts' && (
                    <option value="scheduled">予約投稿</option>
                  )}
                  <option value="archived">アーカイブ</option>
                </select>
              </label>
              {kind === 'posts'
                ? field('published_at', '公開日時（ブラウザの現地時間）', {
                    type: 'datetime-local',
                  })
                : field('sort_order', '表示順（小さい順）', { type: 'number' })}
            </div>
          </section>
          {kind === 'posts' ? (
            <>
              <section className="admin-panel">
                <h2>本文</h2>
                <Editor value={content} onChange={setContent} />
              </section>
              <section className="admin-panel form-stack">
                <div className="form-grid">
                  {field('category', 'カテゴリ')}
                  {field('tags', 'タグ（カンマ区切り）')}
                </div>
                {field('seo_title', 'SEOタイトル')}
                {field('seo_description', 'SEO説明', { area: true })}
              </section>
            </>
          ) : (
            <section className="admin-panel form-stack">
              {field('body', 'ゲーム紹介', { area: true })}
              <div className="form-grid">
                {field('genre', 'ジャンル', { required: true })}
                <label>
                  開発状況
                  <select {...register('development_status')}>
                    {['開発中', 'プロトタイプ', 'リリース済み', '開発休止'].map(
                      (s) => (
                        <option key={s}>{s}</option>
                      ),
                    )}
                  </select>
                </label>
                {field('release_date', 'リリース日', { type: 'date' })}
                {field('tags', 'タグ（カンマ区切り）')}
              </div>
              {field('technologies', '使用技術（カンマ区切り）')}
              {field('screenshots', 'スクリーンショットURL', {
                area: true,
                hint: '1行につき1つの画像URL',
              })}
              <MediaPicker
                label="スクリーンショットを追加"
                onSelect={(url) =>
                  setValue(
                    'screenshots',
                    [getValues('screenshots'), url].filter(Boolean).join('\n'),
                    { shouldDirty: true },
                  )
                }
              />
              {field('trailer_url', 'YouTubeトレーラーURL')}
              <label>
                作品の主要ボタン
                <select
                  {...register('primary_action')}
                  defaultValue={values.primary_action || 'auto'}
                >
                  <option value="auto">外部リンクから自動選択</option>
                  <option value="wishlist">
                    Steamでウィッシュリストに追加
                  </option>
                  <option value="demo">体験版を遊ぶ</option>
                  <option value="buy">購入する</option>
                  <option value="none">表示しない</option>
                </select>
              </label>
              {field('primary_url', '主要ボタンのリンク先', {
                type: 'url',
                hint: 'https URL。空欄の場合はSteam・itch・体験版の外部リンクを使用します。',
              })}
              {field('external_links', '外部リンク', {
                area: true,
                hint: '1行に「Steam | https://store.steampowered.com/app/...」の形式で入力',
              })}
            </section>
          )}
        </>
      )}
      <div className="admin-actions">
        <Button disabled={pending || !hydrated} type="submit">
          {pending ? '保存中…' : '変更を保存'}
        </Button>
        {!!id && kind !== 'settings' && (
          <DeleteDialog
            disabled={pending}
            onConfirm={async () => {
              if (await request({ id, action: 'delete' }))
                router.push(`/admin/${kind}`);
            }}
          />
        )}
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
