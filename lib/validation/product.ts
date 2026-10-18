import { z } from 'zod';
import { ProductStatus } from '@/app/generated/prisma/enums';

export const PRODUCT_LIMITS = {
  description: 1000,
  seoTitle: 60,
  seoDescription: 160,
} as const;

function requiredText(label: string, max: number) {
  return z
    .string({ error: `${label}: потрібен текст` })
    .trim()
    .min(1, `${label} не може бути порожнім`)
    .max(max, `${label}: не більше ${max} символів`);
}

export const productUpdateSchema = z.strictObject({
  description: requiredText('Опис', PRODUCT_LIMITS.description),
  seoTitle: requiredText('SEO-заголовок', PRODUCT_LIMITS.seoTitle),
  seoDescription: requiredText('SEO-опис', PRODUCT_LIMITS.seoDescription),
  status: z.enum(ProductStatus, { error: 'Невідомий статус' }),
});

export type ProductUpdate = z.infer<typeof productUpdateSchema>;
