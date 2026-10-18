import { expect, test } from '@playwright/test';
import { getProductIdByName, getProductValues, loginViaApi, saveProductValues } from './helpers';

test.describe('Публічна частина', () => {
  test('каталог показує лише опубліковані товари', async ({ page }) => {
    await page.goto('/');

    const main = page.getByRole('main');
    await expect(main.getByRole('listitem')).toHaveCount(2);
    await expect(main.getByText('Керамічна чашка «Ранок»')).toBeVisible();
    await expect(main.getByText('Лляний фартух')).toHaveCount(0);
  });

  test('сторінка товару використовує SEO-поля', async ({ page }) => {
    await page.goto('/products/keramichna-chashka-ranok');

    await expect(page).toHaveTitle('Керамічна чашка «Ранок», 350 мл');
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      'Чашка ручної роботи з глазурованої кераміки на 350 мл. Можна мити в посудомийній машині.'
    );
    await expect(page.getByRole('heading', { name: 'Характеристики' })).toBeVisible();
  });

  test('чернетка недоступна за прямим URL і через публічний API', async ({ page, request }) => {
    const pageResponse = await page.goto('/products/llianyi-fartukh');
    expect(pageResponse?.status()).toBe(404);

    const apiResponse = await request.get('/api/products/llianyi-fartukh');
    expect(apiResponse.status()).toBe(404);

    const list = await (await request.get('/api/products')).json();
    expect(list.map((product: { slug: string }) => product.slug)).not.toContain('llianyi-fartukh');
  });

  test('HTML в описі показується як текст і не виконується', async ({ page, request }) => {
    const headers = await loginViaApi(request);
    const id = await getProductIdByName(request, headers, 'Керамічна чашка «Ранок»');
    const original = await getProductValues(request, headers, id);
    const payload = '<img src=x onerror="window.__xss = true"><script>window.__xss = true</script>';

    try {
      await saveProductValues(request, headers, id, { ...original, description: payload });
      await page.goto('/products/keramichna-chashka-ranok');

      await expect(page.getByText('<img src=x onerror=', { exact: false })).toBeVisible();
      await expect(page.getByRole('main').locator('img')).toHaveCount(0);
      expect(await page.evaluate(() => (window as { __xss?: boolean }).__xss)).toBeUndefined();
    } finally {
      await saveProductValues(request, headers, id, original);
    }
  });
});
