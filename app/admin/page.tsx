import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import Chevron from '@/components/Chevron/Chevron';
import LogoutButton from '@/components/LogoutButton/LogoutButton';
import StatusBadge from '@/components/StatusBadge/StatusBadge';
import { getSession } from '@/lib/auth/session';
import { getAllProducts } from '@/lib/products';

export const metadata: Metadata = {
  title: 'Адмін-панель',
};

export const instant = false;

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const products = await getAllProducts();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pt-12 pb-20 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-[32px] leading-tight font-semibold tracking-tight">Товари</h1>
          <p className="text-[15px] text-secondary">Усього: {products.length}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <LogoutButton />
          <p className="text-[13px] text-secondary">{session.email}</p>
        </div>
      </div>

      {products.length === 0 ? (
        <p className="mt-8 rounded-2xl bg-card px-6 py-12 text-center text-[17px] text-secondary">
          Товарів поки немає. Запустіть seed, щоб додати демонстраційні.
        </p>
      ) : (
        <ul className="mt-8 flex flex-col gap-3">
          {products.map(product => (
            <li key={product.id}>
              <Link
                href={`/admin/products/${product.id}`}
                className="flex items-center gap-4 rounded-2xl bg-card px-5 py-4 shadow-[0_1px_2px_rgb(0_0_0/0.04)] transition hover:shadow-[0_8px_24px_rgb(0_0_0/0.08)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent motion-reduce:transition-none"
              >
                <span className="min-w-0 flex-1 text-[17px] font-medium">{product.name}</span>
                <StatusBadge status={product.status} />
                <Chevron direction="right" className="text-accent" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
