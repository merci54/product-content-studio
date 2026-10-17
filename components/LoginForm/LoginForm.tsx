'use client';

import { type SubmitEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAxiosError } from 'axios';
import { login } from '@/lib/api/clientApi';

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    setError('');
    setIsPending(true);

    try {
      await login({
        email: String(formData.get('email')),
        password: String(formData.get('password')),
      });
      router.replace('/admin');
      router.refresh();
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.error : undefined;
      setError(message ?? 'Не вдалося увійти. Спробуйте ще раз.');
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2">
        <span className="text-[15px] font-medium">Email</span>
        <input
          name="email"
          type="email"
          autoComplete="username"
          required
          className="rounded-xl border border-separator bg-card px-4 py-3 text-[17px] outline-accent"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-[15px] font-medium">Пароль</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="rounded-xl border border-separator bg-card px-4 py-3 text-[17px] outline-accent"
        />
      </label>

      {error && (
        <p role="alert" className="text-[15px] text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 rounded-full bg-accent px-6 py-3 text-[17px] font-medium text-white disabled:opacity-60"
      >
        {isPending ? 'Вхід…' : 'Увійти'}
      </button>
    </form>
  );
}
