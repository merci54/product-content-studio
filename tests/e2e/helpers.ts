import { type APIRequestContext, type Page, expect } from '@playwright/test';
import { TEST_ADMIN } from './test-env';

export type ProductValues = {
  description: string;
  seoTitle: string;
  seoDescription: string;
  status: 'DRAFT' | 'PUBLISHED';
};

// Вхід через API: повертає заголовок Cookie для наступних запитів.
export async function loginViaApi(request: APIRequestContext) {
  const response = await request.post('/api/auth/login', { data: TEST_ADMIN });
  expect(response.status()).toBe(200);
  return { Cookie: response.headers()['set-cookie'].split(';')[0] };
}

// Вхід через форму, як це робить користувач.
export async function loginViaForm(page: Page) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(TEST_ADMIN.email);
  await page.getByLabel('Пароль').fill(TEST_ADMIN.password);
  await page.getByRole('button', { name: 'Увійти' }).click();
  await expect(page).toHaveURL('/admin');
}

export async function getProductIdByName(
  request: APIRequestContext,
  headers: Record<string, string>,
  name: string
) {
  const response = await request.get('/api/admin/products', { headers });
  const products: { id: number; name: string }[] = await response.json();
  const product = products.find(item => item.name === name);
  if (!product) throw new Error(`Product "${name}" not found`);
  return product.id;
}

export async function getProductValues(
  request: APIRequestContext,
  headers: Record<string, string>,
  id: number
): Promise<ProductValues> {
  const response = await request.get(`/api/admin/products/${id}`, { headers });
  const { description, seoTitle, seoDescription, status } = await response.json();
  return { description, seoTitle, seoDescription, status };
}

export async function saveProductValues(
  request: APIRequestContext,
  headers: Record<string, string>,
  id: number,
  values: ProductValues
) {
  const response = await request.patch(`/api/admin/products/${id}`, { headers, data: values });
  expect(response.status()).toBe(200);
}
