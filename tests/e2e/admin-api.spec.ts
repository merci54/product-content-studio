import { expect, test } from '@playwright/test';
import { getProductIdByName, getProductValues, loginViaApi, saveProductValues } from './helpers';

const valid = {
  description: 'Новий опис',
  seoTitle: 'Новий заголовок',
  seoDescription: 'Новий SEO-опис',
  status: 'DRAFT',
};

test.describe('Адмін-API', () => {
  test('без входу всі адмін-ендпоінти повертають 401', async ({ request }) => {
    expect((await request.get('/api/admin/products')).status()).toBe(401);
    expect((await request.get('/api/admin/products/1')).status()).toBe(401);
    expect((await request.patch('/api/admin/products/1', { data: valid })).status()).toBe(401);
  });

  test('вхід з невірними даними повертає 401 з однаковим повідомленням', async ({ request }) => {
    const wrongPassword = await request.post('/api/auth/login', {
      data: { email: 'e2e-admin@example.test', password: 'wrong-password' },
    });
    const unknownEmail = await request.post('/api/auth/login', {
      data: { email: 'nobody@example.test', password: 'wrong-password' },
    });

    expect(wrongPassword.status()).toBe(401);
    expect(unknownEmail.status()).toBe(401);
    expect(await wrongPassword.json()).toEqual(await unknownEmail.json());
  });

  test('некоректні дані не зберігаються', async ({ request }) => {
    const headers = await loginViaApi(request);
    const id = await getProductIdByName(request, headers, 'Лляний фартух');
    const original = await getProductValues(request, headers, id);

    const invalidBodies = [
      { ...valid, description: '   ' },
      { ...valid, seoTitle: 'а'.repeat(61) },
      { ...valid, seoDescription: 'а'.repeat(161) },
      { ...valid, description: 'а'.repeat(1001) },
      { ...valid, status: 'ARCHIVED' },
      { ...valid, name: 'Нова назва' },
      { description: 'Лише одне поле' },
    ];

    for (const body of invalidBodies) {
      const response = await request.patch(`/api/admin/products/${id}`, { headers, data: body });
      expect(response.status(), JSON.stringify(body)).toBe(400);
    }

    expect(await getProductValues(request, headers, id)).toEqual(original);
  });

  test('коректні дані зберігаються', async ({ request }) => {
    const headers = await loginViaApi(request);
    const id = await getProductIdByName(request, headers, 'Лляний фартух');
    const original = await getProductValues(request, headers, id);

    try {
      await saveProductValues(request, headers, id, {
        ...original,
        seoTitle: '  Оновлений заголовок  ',
      });
      expect((await getProductValues(request, headers, id)).seoTitle).toBe('Оновлений заголовок');
    } finally {
      await saveProductValues(request, headers, id, original);
    }
  });
});
