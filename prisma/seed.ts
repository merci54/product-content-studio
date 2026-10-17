import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { ProductStatus } from '../app/generated/prisma/client';
import { prisma } from '../lib/db/prisma';

const products = [
  {
    slug: 'keramichna-chashka-ranok',
    name: 'Керамічна чашка «Ранок»',
    status: ProductStatus.PUBLISHED,
    description:
      'Чашка ручної роботи з глазурованої кераміки. Товсті стінки довго тримають тепло, тому кава чи чай не холонуть занадто швидко.',
    seoTitle: 'Керамічна чашка «Ранок», 350 мл',
    seoDescription:
      'Чашка ручної роботи з глазурованої кераміки на 350 мл. Можна мити в посудомийній машині.',
    specs: [
      { label: 'Матеріал', value: 'Кераміка' },
      { label: "Об'єм", value: '350 мл' },
      { label: 'Колір', value: 'Молочний' },
    ],
  },
  {
    slug: 'sklianyi-chainyk-1l',
    name: 'Скляний чайник 1 л',
    status: ProductStatus.PUBLISHED,
    description:
      'Чайник із жароміцного боросилікатного скла зі знімним ситечком для заварювання листового чаю.',
    seoTitle: 'Скляний чайник 1 л із ситечком',
    seoDescription: 'Жароміцний скляний чайник на 1 літр зі знімним ситечком із нержавіючої сталі.',
    specs: [
      { label: 'Матеріал', value: 'Боросилікатне скло' },
      { label: "Об'єм", value: '1 л' },
      { label: 'Ситечко', value: 'Нержавіюча сталь' },
    ],
  },
  {
    slug: 'llianyi-fartukh',
    name: 'Лляний фартух',
    status: ProductStatus.DRAFT,
    description: 'Фартух із натурального льону з регульованим ременем і великою кишенею.',
    seoTitle: 'Лляний фартух із кишенею',
    seoDescription: 'Фартух із натурального льону з регульованим ременем. Чернетка картки.',
    specs: [
      { label: 'Матеріал', value: '100% льон' },
      { label: 'Розмір', value: 'Універсальний' },
    ],
  },
];

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  });

  for (const { specs, ...data } of products) {
    const specRows = specs.map((spec, position) => ({ ...spec, position }));
    await prisma.product.upsert({
      where: { slug: data.slug },
      update: { ...data, specs: { deleteMany: {}, create: specRows } },
      create: { ...data, specs: { create: specRows } },
    });
  }

  console.log(`Seeded admin ${email} and ${products.length} products`);
}

main()
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
