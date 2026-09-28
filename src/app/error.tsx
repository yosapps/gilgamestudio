'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="page-wrap empty-state">
      <h1>読み込みに失敗しました</h1>
      <p>時間をおいてもう一度お試しください。</p>
      <button className="button button-primary" onClick={reset}>
        再読み込み
      </button>
    </main>
  );
}
