'use client';
import { useHydrated } from './use-hydrated';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { validateUpload } from '@/lib/validation';
type Media = { id: string; name: string; url: string; size: number };
export function MediaPicker({
  onSelect,
  label = '画像を選ぶ',
}: {
  onSelect: (url: string, name: string) => void;
  label?: string;
}) {
  const hydrated = useHydrated();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [items, setItems] = useState<Media[]>([]);
  const [more, setMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (open) dialog.current?.showModal();
    else dialog.current?.close();
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(
          '/api/admin/media?' +
            new URLSearchParams({ q: query, page: String(page) }),
          { signal: controller.signal },
        );
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setItems(data.items);
        setMore(data.hasMore);
      } catch (e) {
        if (!controller.signal.aborted)
          setError(
            e instanceof Error ? e.message : '画像を取得できませんでした',
          );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [open, query, page]);
  const select = (url: string, name: string) => {
    onSelect(url, name);
    setOpen(false);
  };
  async function upload(file?: File) {
    if (!file) return;
    if (!validateUpload(file.name, file.type, file.size)) {
      setError('JPEG / PNG / WebP、4MB以下の画像を選んでください');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const body = new FormData();
      body.append('file', file);
      const response = await fetch('/api/admin/media/upload', {
        method: 'POST',
        body,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      select(data.media.url, data.media.name);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'アップロードできませんでした');
    } finally {
      setUploading(false);
    }
  }
  return (
    <>
      <button
        type="button"
        className="button button-outline"
        disabled={!hydrated}
        onClick={() => setOpen(true)}
      >
        {label}
      </button>
      <dialog
        ref={dialog}
        className="media-picker"
        aria-label="画像を選択"
        onKeyDown={(event) => {
          if (
            event.key === 'Enter' &&
            (event.target as HTMLElement).tagName === 'INPUT'
          )
            event.preventDefault();
        }}
        onCancel={() => setOpen(false)}
        onClose={() => setOpen(false)}
      >
        <div className="picker-heading">
          <h2>メディアから画像を選ぶ</h2>
          <button
            type="button"
            className="button button-ghost"
            onClick={() => setOpen(false)}
          >
            閉じる
          </button>
        </div>
        <label>
          画像名で検索
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
          />
        </label>
        <label className="picker-upload">
          新しい画像をアップロード
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            disabled={uploading}
            onChange={(e) => {
              void upload(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
        </label>
        {error && (
          <p role="alert" className="notice error">
            {error}
          </p>
        )}
        {(loading || uploading) && (
          <p role="status">{uploading ? 'アップロード中…' : '読み込み中…'}</p>
        )}
        <div className="picker-grid" aria-busy={loading}>
          {!loading &&
            items.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => select(item.url, item.name)}
              >
                <Image src={item.url} alt="" width={240} height={150} />
                <span>{item.name}</span>
              </button>
            ))}
        </div>
        {!loading && !items.length && (
          <p>
            画像がありません。アップロードするか検索条件を変更してください。
          </p>
        )}
        <div className="picker-pagination">
          <button
            type="button"
            disabled={page === 0 || loading}
            onClick={() => setPage((p) => p - 1)}
          >
            前へ
          </button>
          <span>{page + 1}</span>
          <button
            type="button"
            disabled={!more || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            次へ
          </button>
        </div>
      </dialog>
    </>
  );
}
