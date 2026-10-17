import type { Metadata } from 'next';
import LoginForm from '@/components/LoginForm/LoginForm';

export const metadata: Metadata = {
  title: 'Вхід',
};

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-16">
      <h1 className="text-[32px] leading-tight font-semibold tracking-tight">Вхід</h1>
      <p className="mt-2 mb-8 text-[17px] text-secondary">Адмін-панель Product Content Studio</p>
      <LoginForm />
    </main>
  );
}
