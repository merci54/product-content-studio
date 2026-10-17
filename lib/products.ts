import { connection } from 'next/server';
import { ProductStatus } from '@/app/generated/prisma/client';
import { prisma } from '@/lib/prisma';

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
