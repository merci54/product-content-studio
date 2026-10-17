import { connection } from 'next/server';
import { cache } from 'react';
import { ProductStatus } from '@/app/generated/prisma/client';
import { prisma } from '@/lib/db/prisma';

export async function getPublishedProducts() {
  // better-sqlite3 синхронний: без connection() Next виконає запит під час збірки
  // і закешує каталог, тож щойно опублікований товар у ньому не з'явиться.
  await connection();
  return prisma.product.findMany({
    where: { status: ProductStatus.PUBLISHED },
    select: {
      slug: true,
      name: true,
      description: true,
      specs: { select: { value: true }, orderBy: { position: 'asc' }, take: 2 },
    },
    orderBy: { name: 'asc' },
  });
}

// cache() об'єднує повторні виклики в межах одного запиту:
// generateMetadata і сторінка товару звертаються до бази лише раз.
export const getPublishedProductBySlug = cache(async (slug: string) => {
  await connection();
  // Чернетка й неіснуючий slug дають однаковий результат (null),
  // тож публічна частина не розкриває навіть факт існування чернетки.
  return prisma.product.findUnique({
    where: { slug, status: ProductStatus.PUBLISHED },
    select: {
      slug: true,
      name: true,
      description: true,
      seoTitle: true,
      seoDescription: true,
      specs: { select: { label: true, value: true }, orderBy: { position: 'asc' } },
    },
  });
});
