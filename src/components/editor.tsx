'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import { useState } from 'react';
import type { RichNode } from '@/lib/types';
import { RichContent } from './rich-content';
import { safeUrl, imageUrl } from '@/lib/validation';
export default function Editor({
  value,
  onChange,
}: {
  value: RichNode;
  onChange: (value: RichNode) => void;
}) {
  const [preview, setPreview] = useState(false);
  const [url, setUrl] = useState('');
  const [mode, setMode] = useState<'link' | 'image' | null>(null);
  const [error, setError] = useState('');
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, protocols: ['https'] },
      }),
      ImageExtension,
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getJSON() as RichNode),
  });
  if (!editor) return <div className="skeleton" style={{ height: 380 }} />;
  return (
    <div>
      <div className="editor-toolbar" aria-label="本文書式">
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          data-active={editor.isActive('heading', { level: 2 })}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          data-active={editor.isActive('bold')}
        >
          <b>太字</b>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          斜体
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          箇条書き
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          番号付き
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          引用
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          コード
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('link');
            setError('');
          }}
        >
          リンク
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().unsetLink().run()}
        >
          リンク解除
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('image');
            setError('');
          }}
        >
          画像
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
        >
          戻す
        </button>
        <button
          type="button"
          onClick={() => setPreview(!preview)}
          data-active={preview}
        >
          {preview ? '編集に戻る' : 'プレビュー'}
        </button>
      </div>
      {mode && (
        <div className="admin-panel">
          <label>
            {mode === 'image'
              ? 'メディア管理でコピーした画像URL'
              : 'リンク先URL'}
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              type="url"
            />
          </label>
          <button
            type="button"
            className="button button-outline"
            onClick={() => {
              if (
                !(mode === 'image' ? imageUrl : safeUrl).safeParse(url)
                  .success ||
                !url
              ) {
                setError('有効なhttps URLを入力してください');
                return;
              }
              if (mode === 'image')
                editor
                  .chain()
                  .focus()
                  .setImage({ src: url, alt: '記事内画像' })
                  .run();
              else editor.chain().focus().setLink({ href: url }).run();
              setMode(null);
              setUrl('');
            }}
          >
            挿入
          </button>
          <button
            type="button"
            className="button button-ghost"
            onClick={() => setMode(null)}
          >
            閉じる
          </button>
          {error && <p role="alert">{error}</p>}
        </div>
      )}
      {preview ? (
        <div className="prose editor-preview">
          <RichContent node={value} />
        </div>
      ) : (
        <EditorContent editor={editor} className="prose" />
      )}
    </div>
  );
}
