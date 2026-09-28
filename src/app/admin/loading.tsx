export default function Loading() {
  return (
    <main
      id="main"
      className="page-wrap"
      aria-busy="true"
      aria-label="読み込み中"
    >
      <div className="skeleton" style={{ height: 60, width: '60%' }} />
      <div className="skeleton" style={{ height: 380, marginTop: 40 }} />
    </main>
  );
}
