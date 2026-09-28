import Link from 'next/link';
export default function NotFound() {
  return (
    <main id="main" className="page-wrap empty-state">
      <p className="eyebrow">404 / UNEXPLORED TERRITORY</p>
      <h1>ここは、まだ未知の世界。</h1>
      <p>ページが見つからないか、公開されていません。</p>
      <Link className="button button-primary" href="/">
        ホームへ戻る
      </Link>
    </main>
  );
}
