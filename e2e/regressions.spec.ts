import { expect, test, type Page } from '@playwright/test'

const postId = '11111111-1111-4111-8111-111111111111'
const post = {
  id: postId,
  title: 'Post de teste',
  content: 'Conteúdo de teste.',
  authorId: 'user-1',
  createdAt: '2026-09-12T12:00:00Z',
  updatedAt: '2026-09-12T12:00:00Z',
}

function makeToken(seconds = 3600) {
  const payload = { sub: 'user-1', exp: Math.floor(Date.now() / 1000) + seconds }
  return `e30.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.signature`
}

async function mockApi(page: Page) {
  await page.route('**/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname
    if (path === '/api/auth/login') {
      await route.fulfill({ json: { access_token: makeToken(), token_type: 'Bearer' } })
    } else if (path === '/api/posts') {
      await route.fulfill({ json: [post] })
    } else {
      await route.fulfill({ status: 404, json: { message: 'Post não encontrado' } })
    }
  })
}

test.beforeEach(async ({ page }) => {
  await mockApi(page)
})

test('login retorna à criação solicitada antes da autenticação', async ({ page }) => {
  await page.goto('/admin/posts/new')
  await expect(page).toHaveURL(/\/login\?redirect=/)
  await page.getByLabel('E-mail', { exact: true }).fill('prof@example.test')
  await page.getByLabel('Senha', { exact: true }).fill('senha-de-teste')
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()

  await expect(page.getByRole('heading', { name: 'Criar post', exact: true })).toBeVisible()
  await expect(page).toHaveURL(/\/admin\/posts\/new$/)
  await page.getByLabel('Título', { exact: true }).fill('Rascunho')
  await expect(page.getByLabel('Título', { exact: true })).toHaveValue('Rascunho')
})

test('expiração com formulário aberto encerra a sessão e retorna ao login', async ({ page }) => {
  await page.addInitScript((token) => {
    sessionStorage.setItem('auth_token', token)
    sessionStorage.setItem('auth_email', 'prof@example.test')
  }, makeToken(5))
  await page.goto('/admin/posts/new')
  await expect(page.getByRole('heading', { name: 'Criar post', exact: true })).toBeVisible()

  await expect(page).toHaveURL(/\/login\?redirect=/, { timeout: 10_000 })
  await expect(page.getByRole('heading', { name: 'Entrar', exact: true })).toBeVisible()
  expect(await page.evaluate(() => sessionStorage.getItem('auth_token'))).toBeNull()
  expect(await page.evaluate(() => sessionStorage.getItem('auth_email'))).toBeNull()
})

test('resposta antiga não substitui o resultado da busca atual', async ({ page }) => {
  let releaseOld!: () => void
  const oldGate = new Promise<void>((resolve) => { releaseOld = resolve })
  let markOldStarted!: () => void
  const oldStarted = new Promise<void>((resolve) => { markOldStarted = resolve })
  await page.route('**/api/posts/search?*', async (route) => {
    const term = new URL(route.request().url()).searchParams.get('q')
    if (term === 'antiga') {
      markOldStarted()
      await oldGate
    }
    await route.fulfill({ json: [{ ...post, title: `Resultado ${term}` }] })
  })
  await page.goto('/')
  await expect(page.getByRole('heading', { name: post.title })).toBeVisible()
  await page.getByLabel('Termo de busca').fill('antiga')
  await page.getByRole('button', { name: 'Buscar', exact: true }).click()
  await oldStarted
  const oldResponse = page.waitForResponse((response) =>
    new URL(response.url()).searchParams.get('q') === 'antiga',
  )
  try {
    await page.getByLabel('Termo de busca').fill('atual')
    await page.getByRole('button', { name: 'Buscar', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Resultado atual' })).toBeVisible()
  } finally {
    releaseOld()
  }
  await (await oldResponse).finished()
  // Deixa o navegador processar a resposta e pintar as atualizações pendentes.
  await page.evaluate(() => new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  }))
  await expect(page.getByRole('heading', { name: 'Resultado antiga' })).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Resultado atual' })).toBeVisible()
})

test('URL longa cabe na tela móvel sem rolagem horizontal', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  const content = `https://example.test/${'a'.repeat(250)}`
  await page.route(`**/api/posts/${postId}`, (route) =>
    route.fulfill({ json: { ...post, content } }),
  )
  await page.goto(`/posts/${postId}`)
  await expect(page.getByText(content, { exact: true })).toBeVisible()

  const dimensions = await page.evaluate(() => ({
    viewport: window.innerWidth,
    page: document.documentElement.scrollWidth,
  }))
  expect(dimensions.page).toBeLessThanOrEqual(dimensions.viewport)
})
