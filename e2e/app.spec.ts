import { expect, test } from '@playwright/test'

test('loads the application heading', async ({ page }) => {
  await page.route('**/api/posts', (route) => route.fulfill({ json: [] }))
  await page.goto('/')

  await expect(
    page.getByRole('heading', { name: 'Conteúdo aberto', level: 1 }),
  ).toBeVisible()
  await expect(page.getByText('Nenhum post encontrado.')).toBeVisible()
})
