import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { expect, test, vi } from 'vitest'
import { AuthContext, type AuthContextValue } from '../features/auth/auth-context'
import { EditPostPage } from './EditPostPage'
import type { Post } from '../types/api'

const VALID_ID = '11111111-1111-1111-1111-111111111111'

const ownPost: Post = {
  id: VALID_ID,
  title: 'Titulo original',
  content: 'Conteudo original.',
  authorId: 'user-1',
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
}

function makeAuthValue(overrides: Partial<AuthContextValue> = {}): AuthContextValue {
  return {
    session: {
      accessToken: 'token',
      tokenType: 'Bearer',
      userId: 'user-1',
      expiresAt: Date.now() + 60_000,
      email: 'professor@exemplo.com',
    },
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
    ...overrides,
  }
}

function renderAt(
  path: string,
  getById: (id: string) => Promise<Post>,
  update: (id: string, input: unknown) => Promise<Post> = vi.fn(),
  authOverrides: Partial<AuthContextValue> = {},
) {
  return render(
    <AuthContext.Provider value={makeAuthValue(authOverrides)}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route
            path="/admin/posts/:postId/edit"
            element={<EditPostPage postQueries={{ getById }} postCommands={{ update }} />}
          />
          <Route path="/posts/:postId" element={<p>Pagina do Post</p>} />
          <Route path="/admin" element={<p>Pagina Admin</p>} />
          <Route path="/" element={<p>Pagina Home</p>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

function apiError(status: number, message: string) {
  const error = new Error(message) as Error & { status: number }
  error.status = status
  return error
}

test('post proprio preenche titulo e conteudo no formulario', async () => {
  renderAt(`/admin/posts/${VALID_ID}/edit`, vi.fn().mockResolvedValue(ownPost))

  expect(await screen.findByLabelText('Título')).toHaveValue('Titulo original')
  expect(screen.getByLabelText('Conteúdo')).toHaveValue('Conteudo original.')
})

test('mostra "Publicando como" com a parte antes do "@" do e-mail', async () => {
  renderAt(`/admin/posts/${VALID_ID}/edit`, vi.fn().mockResolvedValue(ownPost))

  expect(await screen.findByText('Publicando como: professor')).toBeInTheDocument()
})

test('mostra link "Voltar para a administracao" apontando pro admin', async () => {
  renderAt(`/admin/posts/${VALID_ID}/edit`, vi.fn().mockResolvedValue(ownPost))

  expect(
    await screen.findByRole('link', { name: '← Voltar para a administração' }),
  ).toHaveAttribute('href', '/admin')
})

test('clicar em "Cancelar" navega para a administracao', async () => {
  renderAt(`/admin/posts/${VALID_ID}/edit`, vi.fn().mockResolvedValue(ownPost))

  fireEvent.click(await screen.findByRole('button', { name: 'Cancelar' }))

  expect(screen.getByText('Pagina Admin')).toBeInTheDocument()
})

test('post de outro autor nao oferece edicao', async () => {
  const postDeOutro: Post = { ...ownPost, authorId: 'user-2' }
  renderAt(`/admin/posts/${VALID_ID}/edit`, vi.fn().mockResolvedValue(postDeOutro))

  const alert = await screen.findByRole('alert')
  expect(alert).toHaveTextContent('Este post é de outro autor. Você não tem permissão para editá-lo.')
  expect(screen.queryByLabelText('Título')).not.toBeInTheDocument()
  expect(within(alert).getByRole('link', { name: 'Voltar para a administração' })).toHaveAttribute(
    'href',
    '/admin',
  )
})

test('sucesso ao salvar navega para a pagina do post', async () => {
  const update = vi.fn().mockResolvedValue({ ...ownPost, title: 'Novo titulo' })
  renderAt(`/admin/posts/${VALID_ID}/edit`, vi.fn().mockResolvedValue(ownPost), update)

  await screen.findByLabelText('Título')
  fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Novo titulo' } })
  fireEvent.click(screen.getByRole('button', { name: /salvar/i }))

  expect(await screen.findByText('Pagina do Post')).toBeInTheDocument()
  expect(update).toHaveBeenCalledWith(VALID_ID, {
    title: 'Novo titulo',
    content: 'Conteudo original.',
  })
})

test('erro 400 ao salvar mostra mensagem e mantem os dados', async () => {
  const update = vi.fn().mockRejectedValue(apiError(400, 'Titulo invalido.'))
  renderAt(`/admin/posts/${VALID_ID}/edit`, vi.fn().mockResolvedValue(ownPost), update)

  await screen.findByLabelText('Título')
  fireEvent.click(screen.getByRole('button', { name: /salvar/i }))

  expect(await screen.findByText('Titulo invalido.')).toBeInTheDocument()
  expect(screen.getByLabelText('Título')).toHaveValue('Titulo original')
})

test('403 defensivo ao salvar mostra mensagem especifica de permissao', async () => {
  const update = vi.fn().mockRejectedValue(apiError(403, 'Forbidden'))
  renderAt(`/admin/posts/${VALID_ID}/edit`, vi.fn().mockResolvedValue(ownPost), update)

  await screen.findByLabelText('Título')
  fireEvent.click(screen.getByRole('button', { name: /salvar/i }))

  expect(await screen.findByText('Você não tem permissão para editar este post.')).toBeInTheDocument()
})

test('404 na carga mostra mensagem e link, sem formulario', async () => {
  renderAt(`/admin/posts/${VALID_ID}/edit`, vi.fn().mockRejectedValue(apiError(404, 'Nao encontrado')))

  const alert = await screen.findByRole('alert')
  expect(alert).toHaveTextContent('Este post não existe ou foi removido.')
  expect(within(alert).getByRole('link', { name: 'Voltar para a administração' })).toBeInTheDocument()
  expect(screen.queryByLabelText('Título')).not.toBeInTheDocument()
})

test('UUID invalido nao chama a API', async () => {
  const getById = vi.fn()
  renderAt('/admin/posts/nao-e-um-uuid/edit', getById)

  expect(await screen.findByRole('alert')).toHaveTextContent('Este post não existe ou foi removido.')
  expect(getById).not.toHaveBeenCalled()
})

test('erro de rede na carga mostra retry, e tentar novamente recupera o post', async () => {
  const getById = vi.fn().mockRejectedValueOnce(new Error('Falha de rede.'))
  getById.mockResolvedValueOnce(ownPost)

  renderAt(`/admin/posts/${VALID_ID}/edit`, getById)

  expect(await screen.findByRole('alert')).toHaveTextContent('Falha de rede.')

  fireEvent.click(screen.getByRole('button', { name: /tentar novamente/i }))

  expect(await screen.findByLabelText('Título')).toHaveValue('Titulo original')
  expect(getById).toHaveBeenCalledTimes(2)
})
