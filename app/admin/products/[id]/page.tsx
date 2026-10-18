import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import Chevron from '@/components/Chevron/Chevron';
import ProductEditor from '@/components/ProductEditor/ProductEditor';
import { getSession } from '@/lib/auth/session';
import { getProductById } from '@/lib/products';
import { parseId } from '@/lib/utils/parseId';

export const metadata: Metadata = {
  title: 'Редагування товару',
};

export const instant = false;

export default async function EditProductPage({ params }: PageProps<'/admin/products/[id]'>) {
  const session = await getSession();
  if (!session) redirect('/login');

  const { id } = await params;
  const productId = parseId(id);
  const product = productId ? await getProductById(productId) : null;
  if (!product) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pt-8 sm:px-6 sm:pt-12">
      <Link
        href="/admin"
        className="inline-flex items-baseline gap-[0.24em] rounded-md text-[17px] text-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        <Chevron direction="left" />
        Товари
      </Link>

      <h1 className="mt-6 text-[32px] leading-tight font-semibold tracking-tight">
        {product.name}
      </h1>
      <p className="mt-2 text-[15px] text-secondary">
        Назва та характеристики доступні лише для перегляду.
      </p>

      {product.specs.length > 0 && (
        <section aria-labelledby="specs-heading" className="mt-8">
          <h2 id="specs-heading" className="text-[15px] font-medium">
            Характеристики
          </h2>
          <dl className="mt-3 divide-y divide-separator rounded-2xl bg-card px-5">
            {product.specs.map(spec => (
              <div key={spec.label} className="flex justify-between gap-6 py-3 text-[15px]">
                <dt className="text-secondary">{spec.label}</dt>
                <dd className="text-right font-medium">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <ProductEditor
        productId={product.id}
        initialValues={{
          description: product.description,
          seoTitle: product.seoTitle,
          seoDescription: product.seoDescription,
          status: product.status,
        }}
      />
    </main>
  );
}
