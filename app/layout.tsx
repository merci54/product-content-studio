import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Product Content Studio',
    template: '%s | Product Content Studio',
  },
  description: 'Каталог товарів інтернет-магазину',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="uk" className="h-full antialiased">
      <body className="flex min-h-full flex-col font-sans">
        <header className="sticky top-0 z-10 border-b border-separator/60 bg-surface/80 backdrop-blur-xl">
          <nav className="mx-auto flex h-12 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
            <Link
              href="/"
              className="rounded-md text-[15px] font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              Product Content Studio
            </Link>
            <Link
              href="/admin"
              className="rounded-md text-[15px] text-secondary hover:text-label focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              Адмін-панель
            </Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
