import { Header, Footer } from '@/components/shell';
import { LoginForm } from '@/components/login-form';
import { configured } from '@/lib/supabase';
export const metadata = {
  title: '管理者ログイン',
  robots: { index: false, follow: false },
};
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const q = await searchParams;
  return (
    <>
      <Header />
      <main id="main" className="login-wrap">
        <p className="eyebrow">STUDIO WORKSPACE</p>
        <h1>おかえりなさい。</h1>
        <p className="muted">
          許可された管理者アカウントでログインしてください。
        </p>
        {!configured() && (
          <p className="notice">
            Supabase未設定です。.env.localを設定し、SQLマイグレーションと管理者登録を行ってください。
          </p>
        )}
        {q.error === 'forbidden' && (
          <p role="alert" className="notice error">
            管理者権限がありません。
          </p>
        )}
        <LoginForm enabled={configured()} />
      </main>
      <Footer />
    </>
  );
}
