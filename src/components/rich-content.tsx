import Image from 'next/image';
import type { RichNode } from '@/lib/types';
import { imageUrl, safeUrl } from '@/lib/validation';
import { Fragment, type ReactNode } from 'react';
// Render only allowlisted nodes. Never render user-supplied HTML.
export function RichContent({
  node,
  depth = 0,
}: {
  node: RichNode;
  depth?: number;
}) {
  if (depth > 30 || !node || typeof node !== 'object') return null;
  const children = node.content?.map((n, i) => (
    <RichContent node={n} depth={depth + 1} key={i} />
  ));
  if (node.type === 'text') {
    let text: ReactNode = node.text;
    for (const mark of node.marks || []) {
      if (mark.type === 'bold') text = <strong>{text}</strong>;
      if (mark.type === 'italic') text = <em>{text}</em>;
      if (mark.type === 'code') text = <code>{text}</code>;
      if (mark.type === 'strike') text = <s>{text}</s>;
      if (
        mark.type === 'link' &&
        typeof mark.attrs?.href === 'string' &&
        safeUrl.safeParse(mark.attrs.href).success &&
        mark.attrs.href
      )
        text = (
          <a href={mark.attrs.href} rel="noopener noreferrer">
            {text}
          </a>
        );
    }
    return <>{text}</>;
  }
  switch (node.type) {
    case 'doc':
      return <>{children}</>;
    case 'paragraph':
      return <p>{children}</p>;
    case 'heading':
      return node.attrs?.level === 3 ? (
        <h3>{children}</h3>
      ) : (
        <h2>{children}</h2>
      );
    case 'bulletList':
      return <ul>{children}</ul>;
    case 'orderedList':
      return <ol>{children}</ol>;
    case 'listItem':
      return <li>{children}</li>;
    case 'blockquote':
      return <blockquote>{children}</blockquote>;
    case 'codeBlock':
      return (
        <pre>
          <code>{children}</code>
        </pre>
      );
    case 'hardBreak':
      return <br />;
    case 'horizontalRule':
      return <hr />;
    case 'image': {
      const src = node.attrs?.src;
      return typeof src === 'string' &&
        src &&
        imageUrl.safeParse(src).success ? (
        <figure>
          <Image
            src={src}
            alt={String(node.attrs?.alt || '記事内画像')}
            width={1200}
            height={700}
          />
        </figure>
      ) : null;
    }
    default:
      return <Fragment>{children}</Fragment>;
  }
}
