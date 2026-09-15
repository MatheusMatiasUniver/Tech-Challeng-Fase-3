import { expect, test, type Page } from '@playwright/test'

const PASSWORD = '123456'

async function login(page: Page, email: string) {
  await page.goto('/login')
  await page.getByLabel('E-mail', { exact: true }).fill(email)
  await page.getByLabel('Senha', { exact: true }).fill(PASSWORD)
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page).toHaveURL(/\/admin$/)
}

async function logout(page: Page) {
  await page.getByRole('button', { name: 'Sair', exact: true }).click()
  await expect(page).toHaveURL('/')
}

test('professor cria, edita e exclui um post (API real)', async ({ page }) => {
  const title = `Post E2E ${Date.now()}`
  const editedTitle = `${title} (editado)`

  await login(page, 'professor@exemplo.com')

  await page.getByRole('link', { name: '+ Novo post' }).click()
  await expect(page.getByRole('heading', { name: 'Criar post', exact: true })).toBeVisible()
  await page.getByLabel('Título', { exact: true }).fill(title)
  await page.getByLabel('Conteúdo', { exact: true }).fill('Conteúdo criado pelo teste E2E.')
  await page.getByRole('button', { name: 'Salvar', exact: true }).click()

  await expect(page.getByRole('heading', { name: 'Post criado com sucesso!' })).toBeVisible()
  await page.getByRole('button', { name: 'Ver post', exact: true }).click()
  await expect(page.getByRole('heading', { name: title })).toBeVisible()

  await page.goto('/')
  await expect(page.getByRole('heading', { name: title })).toBeVisible()

  await page.goto('/admin')
  await page
    .getByRole('listitem')
    .filter({ hasText: title })
    .getByRole('button', { name: `Editar ${title}` })
    .click()
  await expect(page.getByRole('heading', { name: 'Editar post', exact: true })).toBeVisible()
  await page.getByLabel('Título', { exact: true }).fill(editedTitle)
  await page.getByRole('button', { name: 'Salvar', exact: true }).click()
  await expect(page.getByRole('heading', { name: editedTitle })).toBeVisible()

  await page.goto('/admin')
  await page
    .getByRole('listitem')
    .filter({ hasText: editedTitle })
    .getByRole('button', { name: `Excluir ${editedTitle}` })
    .click()
  await expect(page.getByRole('heading', { name: 'Excluir post?' })).toBeVisible()
  await page.getByRole('button', { name: 'Excluir', exact: true }).click()
  await expect(page.getByRole('heading', { name: editedTitle })).toHaveCount(0)

  await page.goto('/')
  await expect(page.getByRole('heading', { name: editedTitle })).toHaveCount(0)
})

test('um professor não pode editar o post de outro autor', async ({ page, request }) => {
  await login(page, 'professor1@exemplo.com')
  const token = await page.evaluate(() => sessionStorage.getItem('auth_token'))

  const created = await request.post('/api/posts', {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      title: `Post de outro autor ${Date.now()}`,
      content: 'Post criado via API para o teste de autoria.',
    },
  })
  expect(created.ok()).toBe(true)
  const otherAuthorsPost = await created.json()

  try {
    await logout(page)
    await login(page, 'professor2@exemplo.com')
    await page.goto(`/admin/posts/${otherAuthorsPost.id}/edit`)

    await expect(page.getByRole('alert')).toContainText(
      'Este post é de outro autor. Você não tem permissão para editá-lo.',
    )
    await expect(
      page.getByRole('alert').getByRole('link', { name: 'Voltar para a administração' }),
    ).toBeVisible()
  } finally {
    await request.delete(`/api/posts/${otherAuthorsPost.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  }
})
