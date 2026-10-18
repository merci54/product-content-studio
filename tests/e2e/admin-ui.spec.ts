import { expect, test } from '@playwright/test';
import {
  getProductIdByName,
  getProductValues,
  loginViaApi,
  loginViaForm,
  saveProductValues,
} from './helpers';

test.describe('Адмін-панель', () => {
  test('без входу перенаправляє на сторінку входу', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL('/login');
  });

  test('опублікована чернетка з’являється в каталозі', async ({ page, request }) => {
    const headers = await loginViaApi(request);
    const id = await getProductIdByName(request, headers, 'Лляний фартух');
    const original = await getProductValues(request, headers, id);

    try {
      await loginViaForm(page);
      await page.getByRole('link', { name: /Лляний фартух/ }).click();
      await page.getByRole('radio', { name: /Опубліковано/ }).check();
      await page.getByRole('button', { name: 'Зберегти зміни' }).click();
      await expect(page.getByText('Зміни збережено')).toBeVisible();

      await page.goto('/');
      await expect(page.getByRole('main').getByText('Лляний фартух')).toBeVisible();
    } finally {
      await saveProductValues(request, headers, id, original);
    }
  });

  test('занадто довгий SEO-заголовок не відправляється на сервер', async ({ page }) => {
    const patchRequests: string[] = [];
    page.on('request', req => {
      if (req.method() === 'PATCH') patchRequests.push(req.url());
    });

    await loginViaForm(page);
    await page.getByRole('link', { name: /Лляний фартух/ }).click();
    await page.getByLabel('SEO-заголовок').fill('а'.repeat(61));

    await expect(page.getByText('61 / 60')).toBeVisible();
    await page.getByRole('button', { name: 'Зберегти зміни' }).click();
    await expect(page.getByText('SEO-заголовок: не більше 60 символів')).toBeVisible();
    expect(patchRequests).toHaveLength(0);
  });

  test('невдале збереження не стирає правки й не показується як успішне', async ({ page }) => {
    await loginViaForm(page);
    await page.getByRole('link', { name: /Лляний фартух/ }).click();
    await expect(page).toHaveURL(/\/admin\/products\/\d+$/);
    const editorUrl = page.url();

    await page.route('**/api/admin/products/*', route => route.abort());
    await page.getByLabel('Опис', { exact: true }).fill('Незбережена правка');
    await page.getByRole('button', { name: 'Зберегти зміни' }).click();

    await expect(
      page.getByRole('alert').filter({ hasText: "Немає зв'язку із сервером" })
    ).toBeVisible();
    await expect(page.getByText('Зміни збережено')).toHaveCount(0);
    await expect(page.getByLabel('Опис', { exact: true })).toHaveValue('Незбережена правка');
    // У новій вкладці — дані з бази: правка справді не збереглася.
    const freshPage = await page.context().newPage();
    await freshPage.goto(editorUrl);
    await expect(freshPage.getByLabel('Опис', { exact: true })).not.toHaveValue(
      'Незбережена правка'
    );
  });

  test('після виходу адмін-панель знову недоступна', async ({ page }) => {
    await loginViaForm(page);
    await page.getByRole('button', { name: 'Вийти' }).click();
    await expect(page).toHaveURL('/login');

    await page.goto('/admin');
    await expect(page).toHaveURL('/login');
  });
});
