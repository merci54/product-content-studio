import { describe, expect, it } from 'vitest';
import { PRODUCT_LIMITS, productUpdateSchema } from '@/lib/validation/product';

const valid = {
  description: 'Опис товару',
  seoTitle: 'SEO-заголовок',
  seoDescription: 'Опис для пошукових систем',
  status: 'DRAFT',
};

const textFields = ['description', 'seoTitle', 'seoDescription'] as const;

describe('productUpdateSchema', () => {
  it('приймає коректні дані й обрізає пробіли по краях', () => {
    const result = productUpdateSchema.safeParse({ ...valid, seoTitle: '  Заголовок  ' });

    expect(result.success).toBe(true);
    expect(result.data?.seoTitle).toBe('Заголовок');
  });

  it.each([
    ['description', PRODUCT_LIMITS.description],
    ['seoTitle', PRODUCT_LIMITS.seoTitle],
    ['seoDescription', PRODUCT_LIMITS.seoDescription],
  ])('%s: приймає рівно %i символів і відхиляє на один більше', (field, max) => {
    expect(productUpdateSchema.safeParse({ ...valid, [field]: 'а'.repeat(max) }).success).toBe(
      true
    );
    expect(productUpdateSchema.safeParse({ ...valid, [field]: 'а'.repeat(max + 1) }).success).toBe(
      false
    );
  });

  it.each(textFields)('%s: відхиляє порожній рядок і рядок із самих пробілів', field => {
    expect(productUpdateSchema.safeParse({ ...valid, [field]: '' }).success).toBe(false);
    expect(productUpdateSchema.safeParse({ ...valid, [field]: '   ' }).success).toBe(false);
  });

  it.each(textFields)('%s: відхиляє відсутнє поле', field => {
    const withoutField: Record<string, string> = { ...valid };
    delete withoutField[field];
    expect(productUpdateSchema.safeParse(withoutField).success).toBe(false);
  });

  it('відхиляє невідомий статус', () => {
    expect(productUpdateSchema.safeParse({ ...valid, status: 'ARCHIVED' }).success).toBe(false);
  });

  it('відхиляє поля лише для перегляду: назву та характеристики', () => {
    expect(productUpdateSchema.safeParse({ ...valid, name: 'Нова назва' }).success).toBe(false);
    expect(productUpdateSchema.safeParse({ ...valid, specs: [] }).success).toBe(false);
  });
});
