import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import LogoutButton from '@/components/LogoutButton/LogoutButton';

export const metadata: Metadata = {
  title: 'Адмін-панель',
};

export const instant = false;

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pt-12 pb-20 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-[32px] leading-tight font-semibold tracking-tight">Товари</h1>
        <LogoutButton />
      </div>
      <p className="mt-2 text-[15px] text-secondary">Ви увійшли як {session.email}</p>
    </main>
  );
}
