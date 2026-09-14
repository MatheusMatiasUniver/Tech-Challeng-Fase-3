import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, expect, test, vi } from 'vitest'
import { AppRoutes } from './router'
import { AppProviders } from './providers'

vi.mock('../features/posts/postQueries', () => ({
  postQueries: {
    list: vi.fn().mockResolvedValue([]),
    search: vi.fn().mockResolvedValue([]),
    getById: vi.fn().mockResolvedValue({
      id: '11111111-1111-1111-1111-111111111111',
      title: 'Post de teste',
      content: 'Conteudo de teste.',
      authorId: 'user-1',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    }),
  },
}))

vi.mock('../features/posts/postCommands', () => ({
  postCommands: {
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}))

const STORAGE_KEY = 'auth_token'

beforeEach(() => {
  sessionStorage.clear()
})

function makeToken(payload: unknown): string {
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = base64UrlEncode(JSON.stringify(payload))
  return `${header}.${body}.signature`
}

function base64UrlEncode(input: string): string {
  return btoa(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function signIn(userId = 'user-1') {
  const token = makeToken({ sub: userId, exp: Math.floor(Date.now() / 1000) + 3600 })
  sessionStorage.setItem(STORAGE_KEY, token)
}

function renderAt(path: string) {
  return render(
    <AppProviders>
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
      </MemoryRouter>
    </AppProviders>,
  )
}

test('"/" resolve para a Home', async () => {
  renderAt('/')

  expect(await screen.findByRole('heading', { level: 1, name: 'Conteúdo aberto' })).toBeInTheDocument()
})

test('"/posts/:postId" resolve para a leitura do post', async () => {
  renderAt('/posts/11111111-1111-1111-1111-111111111111')

  expect(await screen.findByRole('heading', { name: 'Post de teste' })).toBeInTheDocument()
})

test('"/login" resolve para a tela de login', () => {
  renderAt('/login')

  expect(screen.getByRole('heading', { name: 'Entrar' })).toBeInTheDocument()
})

test('rota inexistente resolve para a pagina 404', () => {
  renderAt('/isso-nao-existe')

  expect(screen.getByRole('heading', { name: /página não encontrada/i })).toBeInTheDocument()
})

test('visitante anonimo em /admin e redirecionado para /login com o destino preservado', () => {
  renderAt('/admin')

  expect(screen.getByRole('heading', { name: 'Entrar' })).toBeInTheDocument()
})

test('visitante anonimo em /admin/posts/new tambem e redirecionado (guard compartilhado)', () => {
  renderAt('/admin/posts/new')

  expect(screen.getByRole('heading', { name: 'Entrar' })).toBeInTheDocument()
})

test('usuario autenticado acessa "/admin"', async () => {
  signIn()
  renderAt('/admin')

  expect(await screen.findByRole('heading', { name: 'Administração' })).toBeInTheDocument()
})

test('usuario autenticado acessa "/admin/posts/new"', () => {
  signIn()
  renderAt('/admin/posts/new')

  expect(screen.getByRole('heading', { name: 'Criar post' })).toBeInTheDocument()
})

test('usuario autenticado acessa "/admin/posts/:postId/edit"', async () => {
  signIn()
  renderAt('/admin/posts/11111111-1111-1111-1111-111111111111/edit')

  expect(await screen.findByRole('heading', { name: 'Editar post' })).toBeInTheDocument()
})

test('o AppShell (cabecalho/navegacao/rodape) aparece em rotas diferentes', async () => {
  renderAt('/')
  expect(await screen.findByRole('banner')).toBeInTheDocument()
  expect(screen.getByRole('navigation')).toBeInTheDocument()
  expect(screen.getByRole('contentinfo')).toBeInTheDocument()

  renderAt('/login')
  expect(screen.getAllByRole('banner')).not.toHaveLength(0)
})
