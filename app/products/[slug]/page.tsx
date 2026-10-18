import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Chevron from '@/components/Chevron/Chevron';
import { getPublishedProductBySlug } from '@/lib/products';

export async function generateMetadata({
  params,
}: PageProps<'/products/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublishedProductBySlug(slug);
  if (!product) return {};

  return {
    title: { absolute: product.seoTitle },
    description: product.seoDescription,
  };
}

export default async function ProductPage({ params }: PageProps<'/products/[slug]'>) {
  const { slug } = await params;
  const product = await getPublishedProductBySlug(slug);
  if (!product) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pt-8 pb-20 sm:px-6 sm:pt-12">
      <Link
        href="/"
        className="inline-flex items-baseline gap-[0.24em] rounded-md text-[17px] text-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        <Chevron direction="left" />
        Каталог
      </Link>

      <h1 className="mt-6 text-[32px] leading-tight font-semibold tracking-tight sm:text-5xl">
        {product.name}
      </h1>

      {/* Опис виводиться як текст: React екранує HTML, тож вміст не може виконатися як код. */}
      <p className="mt-6 text-[17px] leading-relaxed whitespace-pre-line sm:text-[19px]">
        {product.description}
      </p>

      {product.specs.length > 0 && (
        <section aria-labelledby="specs-heading" className="mt-12">
          <h2 id="specs-heading" className="text-[21px] font-semibold tracking-tight">
            Характеристики
          </h2>
          <dl className="mt-4 divide-y divide-separator rounded-3xl bg-card px-6">
            {product.specs.map(spec => (
              <div key={spec.label} className="flex justify-between gap-6 py-4 text-[17px]">
                <dt className="text-secondary">{spec.label}</dt>
                <dd className="text-right font-medium">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </main>
  );
}
