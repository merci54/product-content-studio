import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 py-24 text-center sm:px-6">
      <p className="text-[15px] font-medium text-secondary">404</p>
      <h1 className="mt-2 text-[32px] leading-tight font-semibold tracking-tight">
        Сторінку не знайдено
      </h1>
      <p className="mt-4 max-w-md text-[17px] leading-relaxed text-secondary">
        Можливо, товар ще не опублікований або посилання застаріло.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-accent px-6 py-3 text-[15px] font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        Перейти до каталогу
      </Link>
    </main>
  );
}
