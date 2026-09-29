'use client';
import { useTranslator } from '@/components/language-provider';

import { useActionState } from 'react';
import { login } from '@/app/login/actions';
import { Button } from './ui/button';
export function LoginForm({ enabled }: { enabled: boolean }) {
  const t = useTranslator();
  const [state, action, pending] = useActionState(login, { error: '' });
  return (
    <form action={action} className="form-stack">
      <label>
        {t('メールアドレス')}
        <input
          name="email"
          type="email"
          required
          autoComplete="username"
          disabled={!enabled}
        />
      </label>
      <label>
        {t('パスワード')}
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
          {t(state.error)}
        </p>
      )}
      <Button disabled={pending || !enabled}>
        {pending ? t('ログイン中…') : t('ログイン')}
      </Button>
    </form>
  );
}
