'use client';
import { useEffect, useRef, useState } from 'react';
import { parseDraft, type Draft, type DraftData } from '@/lib/drafts';
export function useFormDraft(
  key: string,
  snapshot: DraftData,
  baseUpdatedAt: string,
  restore: (data: DraftData) => void,
) {
  const serialized = JSON.stringify(snapshot);
  const baseline = useRef(serialized);
  const [ready, setReady] = useState(false);
  const [candidate, setCandidate] = useState<Draft | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const draft = parseDraft(localStorage.getItem(key), key);
        if (draft && JSON.stringify(draft.data) !== baseline.current)
          setCandidate(draft);
      } catch {
        setError('ブラウザへの下書き保存を利用できません');
      }
      setReady(true);
    }, 0);
    return () => clearTimeout(timer);
  }, [key]);
  useEffect(() => {
    if (!ready || candidate) return;
    const timer = setTimeout(() => {
      if (serialized === baseline.current) return;
      try {
        const savedAt = Date.now();
        const draft: Draft = {
          version: 1,
          key,
          savedAt,
          baseUpdatedAt,
          data: JSON.parse(serialized),
        };
        localStorage.setItem(key, JSON.stringify(draft));
        setSavedAt(savedAt);
        setError('');
      } catch {
        setError('下書きを保存できません。変更を保存ボタンで保存してください');
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [ready, candidate, serialized, key, baseUpdatedAt]);
  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (serialized !== baseline.current) {
        event.preventDefault();
      }
    };
    const flush = () => {
      if (ready && !candidate && serialized !== baseline.current) {
        try {
          const draft: Draft = {
            version: 1,
            key,
            savedAt: Date.now(),
            baseUpdatedAt,
            data: JSON.parse(serialized),
          };
          localStorage.setItem(key, JSON.stringify(draft));
        } catch {
          /* beforeunload still warns */
        }
      }
    };
    window.addEventListener('beforeunload', handler);
    window.addEventListener('pagehide', flush);
    return () => {
      flush();
      window.removeEventListener('beforeunload', handler);
      window.removeEventListener('pagehide', flush);
    };
  }, [serialized, key, ready, candidate, baseUpdatedAt]);
  function discard() {
    try {
      localStorage.removeItem(key);
    } catch {
      /* status remains visible */
    }
    setCandidate(null);
  }
  function recover() {
    if (candidate) restore(candidate.data);
    setCandidate(null);
  }
  function beginSave() {
    return Date.now();
  }
  function markSaved(saved: DraftData, submittedAt = Date.now()) {
    baseline.current = JSON.stringify(saved);
    try {
      const draft = parseDraft(localStorage.getItem(key), key);
      if (
        !draft ||
        draft.savedAt <= submittedAt ||
        JSON.stringify(draft.data) === baseline.current
      )
        localStorage.removeItem(key);
    } catch {
      /* DB save succeeded */
    }
    setSavedAt(null);
    setCandidate(null);
  }
  return { candidate, savedAt, error, recover, discard, beginSave, markSaved };
}
export function DraftNotice({
  draft,
  baseUpdatedAt,
  saveLabel = '変更を保存',
}: {
  draft: ReturnType<typeof useFormDraft>;
  baseUpdatedAt: string;
  saveLabel?: string;
}) {
  return (
    <div className="draft-status">
      {draft.candidate && (
        <div className="notice">
          <p>
            このブラウザに未保存の下書きがあります（
            {new Date(draft.candidate.savedAt).toLocaleString('ja-JP')}）。
            {draft.candidate.baseUpdatedAt !== baseUpdatedAt &&
              '保存後に元データが更新されています。復元前に内容を確認してください。'}
          </p>
          <button
            type="button"
            className="button button-outline"
            onClick={draft.recover}
          >
            下書きを復元
          </button>{' '}
          <button
            type="button"
            className="button button-ghost"
            onClick={draft.discard}
          >
            破棄する
          </button>
        </div>
      )}
      <p className="muted" role="status">
        {draft.error ||
          (draft.savedAt
            ? 'このブラウザに自動保存しました · ' +
              new Date(draft.savedAt).toLocaleTimeString('ja-JP')
            : '編集中の下書きはこのブラウザに自動保存されます。公開には「' +
              saveLabel +
              '」が必要です。')}
      </p>
    </div>
  );
}
