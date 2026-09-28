'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactSchema } from '@/lib/validation';
import { Button } from './ui/button';
import type { z } from 'zod';
export function ContactForm({ enabled }: { enabled: boolean }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: { website: '' },
  });
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  return (
    <form
      className="form-stack"
      onSubmit={handleSubmit(async (values) => {
        setMessage('');
        try {
          const response = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(values),
          });
          const data = await response.json();
          setSuccess(response.ok);
          setMessage(data.message || data.error);
          if (response.ok) reset();
        } catch {
          setSuccess(false);
          setMessage('通信に失敗しました。時間をおいてお試しください。');
        }
      })}
    >
      <label>
        お名前 *
        <input {...register('name')} autoComplete="name" disabled={!enabled} />
        {errors.name && (
          <span className="field-error">お名前を入力してください</span>
        )}
      </label>
      <label>
        メールアドレス *
        <input
          {...register('email')}
          type="email"
          autoComplete="email"
          disabled={!enabled}
        />
        {errors.email && (
          <span className="field-error">
            有効なメールアドレスを入力してください
          </span>
        )}
      </label>
      <label>
        お問い合わせ内容 *
        <textarea {...register('message')} rows={7} disabled={!enabled} />
        {errors.message && (
          <span className="field-error">10〜5000文字で入力してください</span>
        )}
      </label>
      <div className="honeypot" aria-hidden="true">
        <input
          {...register('website')}
          tabIndex={-1}
          autoComplete="off"
          aria-label="入力しないでください"
        />
      </div>
      {message && (
        <p
          role={success ? 'status' : 'alert'}
          className={`notice ${success ? 'success' : 'error'}`}
        >
          {message}
        </p>
      )}
      <Button disabled={!enabled || isSubmitting}>
        {isSubmitting ? '送信中…' : 'メッセージを送信 ↗'}
      </Button>
    </form>
  );
}
