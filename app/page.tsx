import Link from 'next/link';
import { Suspense } from 'react';
import Chevron from '@/components/Chevron/Chevron';
import { getPublishedProducts } from '@/lib/products';

const CARD_WIDTH = 'sm:basis-[calc((100%-1.25rem)/2)] lg:basis-[calc((100%-2.5rem)/3)]';

export default function CatalogPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 pt-12 pb-20 sm:px-6 sm:pt-20">
      <h1 className="text-[32px] leading-tight font-semibold tracking-tight sm:text-5xl">
        Каталог
      </h1>
      <p className="mt-3 max-w-xl text-[17px] leading-relaxed text-secondary sm:text-xl">
        Речі для дому, описані так, щоб їх хотілося взяти в руки.
      </p>

      <Suspense fallback={<CatalogSkeleton />}>
        <ProductList />
      </Suspense>
    </main>
  );
}

async function ProductList() {
  const products = await getPublishedProducts();

  if (products.length === 0) {
    return (
      <p className="mt-12 rounded-3xl bg-card px-6 py-16 text-center text-[17px] text-secondary">
        Опублікованих товарів поки немає. Загляньте трохи згодом.
      </p>
    );
  }

  return (
    <ul className="mt-10 flex flex-col gap-5 sm:mt-14 sm:flex-row sm:flex-wrap">
      {products.map(product => (
        <li key={product.slug} className={`flex ${CARD_WIDTH}`}>
          <Link
            href={`/products/${product.slug}`}
            className="group flex w-full flex-col rounded-3xl bg-card p-7 shadow-[0_1px_2px_rgb(0_0_0/0.04)] transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgb(0_0_0/0.08)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          >
            {product.specs.length > 0 && (
              <p className="text-[13px] font-medium text-secondary">
                {product.specs.map(spec => spec.value).join(' · ')}
              </p>
            )}
            <h2 className="mt-2 text-[21px] leading-snug font-semibold tracking-tight">
              {product.name}
            </h2>
            <p className="mt-3 line-clamp-3 text-[15px] leading-relaxed text-secondary">
              {product.description}
            </p>
            <span className="mt-auto inline-flex items-baseline gap-[0.24em] pt-6 text-[17px] text-accent">
              Детальніше
              <Chevron
                direction="right"
                className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
              />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function CatalogSkeleton() {
  return (
    <div role="status" className="mt-10 flex flex-col gap-5 sm:mt-14 sm:flex-row sm:flex-wrap">
      <span className="sr-only">Завантаження товарів…</span>
      {[0, 1, 2].map(index => (
        <div
          key={index}
          aria-hidden="true"
          className={`h-64 animate-pulse rounded-3xl bg-card motion-reduce:animate-none ${CARD_WIDTH}`}
        />
      ))}
    </div>
  );
}
