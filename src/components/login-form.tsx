'use client';
import { useActionState } from 'react';
import { login } from '@/app/login/actions';
import { Button } from './ui/button';
export function LoginForm({ enabled }: { enabled: boolean }) {
  const [state, action, pending] = useActionState(login, { error: '' });
  return (
    <form action={action} className="form-stack">
      <label>
        メールアドレス
        <input
          name="email"
          type="email"
          required
          autoComplete="username"
          disabled={!enabled}
        />
      </label>
      <label>
        パスワード
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          disabled={!enabled}
        />
      </label>
      {state.error && (
        <p role="alert" className="notice error">
          {state.error}
        </p>
      )}
      <Button disabled={pending || !enabled}>
        {pending ? 'ログイン中…' : 'ログイン'}
      </Button>
    </form>
  );
}
