'use client';

import { useRouter } from 'next/navigation';
import { logout } from '@/lib/api/clientApi';

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.replace('/login');
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="text-[15px] text-accent hover:underline"
    >
      Вийти
    </button>
  );
}
