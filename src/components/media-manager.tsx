'use client';
import { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from './ui/button';
import { DeleteDialog } from './delete-dialog';
import { validateUpload } from '@/lib/validation';
type Media = { id: string; name: string; url: string; size: number };
export function MediaManager({ initial }: { initial: Media[] }) {
  const [items, setItems] = useState(initial);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const input = useRef<HTMLInputElement>(null);
  async function upload(file?: File) {
    if (!file) return;
    setError('');
    setNotice('');
    if (!validateUpload(file.name, file.type, file.size)) {
      setError('JPEG / PNG / WebP、4MB以下の画像を選んでください。');
      return;
    }
    setProgress(0);
    const form = new FormData();
    form.append('file', file);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/admin/media/upload');
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable)
        setProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      setProgress(null);
      try {
        const result = JSON.parse(xhr.responseText);
        if (xhr.status >= 400) {
          setError(result.error || 'アップロードに失敗しました');
          return;
        }
        setItems((v) => [result.media, ...v]);
        setNotice(
          '画像をアップロードしました。URLをコピーして記事やゲームに設定できます。',
        );
        if (input.current) input.current.value = '';
      } catch {
        setError('応答の読み取りに失敗しました');
      }
    };
    xhr.onerror = () => {
      setProgress(null);
      setError('通信に失敗しました。再度お試しください。');
    };
    xhr.send(form);
  }
  async function remove(id: string) {
    setError('');
    try {
      const res = await fetch('/api/admin/media/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      setItems((v) => v.filter((x) => x.id !== id));
      setNotice('削除しました');
    } catch (e) {
      setError(e instanceof Error ? e.message : '削除に失敗しました');
    }
  }
  return (
    <>
      <section className="admin-panel">
        <label>
          画像をアップロード
          <input
            ref={input}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            disabled={progress !== null}
            onChange={(e) => upload(e.target.files?.[0])}
          />
        </label>
        <p className="muted">
          JPEG / PNG / WebP ·
          最大4MB。画像は公開URLで配信されます。非公開資料はアップロードしないでください。
        </p>
        {progress !== null && (
          <div role="status">
            <progress className="progress" value={progress} max={100} />
            <span>
              {progress === 100
                ? '画像を検証・保存しています…'
                : `アップロード中 ${progress}%`}
            </span>
          </div>
        )}
        {error && (
          <p role="alert" className="notice error">
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="notice success">
            {notice}
          </p>
        )}
      </section>
      <div className="media-grid">
        {items.map((item) => (
          <article key={item.id} className="media-item">
            <Image src={item.url} alt={item.name} width={500} height={300} />
            <p>
              {item.name}
              <br />
              <span className="muted">{(item.size / 1024).toFixed(0)} KB</span>
            </p>
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(item.url);
                  setNotice('URLをコピーしました');
                } catch {
                  setError(
                    'コピーできませんでした。画像を新しいタブで開いてURLを取得してください。',
                  );
                }
              }}
            >
              URLをコピー
            </Button>
            <DeleteDialog onConfirm={() => remove(item.id)} />
          </article>
        ))}
      </div>
      {!items.length && <p className="empty-state">画像はまだありません。</p>}
    </>
  );
}
