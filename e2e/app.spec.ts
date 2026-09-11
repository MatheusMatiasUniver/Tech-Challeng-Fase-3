import { expect, test } from '@playwright/test'

test('loads the application heading', async ({ page }) => {
  await page.goto('/')

  await expect(
    page.getByRole('heading', { name: /blog fiap/i }),
  ).toBeVisible()
})
