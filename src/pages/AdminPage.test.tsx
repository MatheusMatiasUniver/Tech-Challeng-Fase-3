import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { expect, test, vi } from 'vitest'
import { AuthContext, type AuthContextValue } from '../features/auth/auth-context'
import { AdminPage } from './AdminPage'
import type { Post } from '../types/api'

function makePost(id: string, title: string, authorId: string): Post {
  return {
    id,
    title,
    content: `Conteudo de ${title}.`,
    authorId,
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
  }
}

const ownPost = makePost('post-1', 'Post proprio', 'user-1')
const otherPost = makePost('post-2', 'Post de outro', 'user-2')

function makeAuthValue(overrides: Partial<AuthContextValue> = {}): AuthContextValue {
  return {
    session: { accessToken: 'token', tokenType: 'Bearer', userId: 'user-1', expiresAt: Date.now() + 60_000 },
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
    ...overrides,
  }
}

function renderPage(
  list: () => Promise<Post[]>,
  remove: (id: string) => Promise<void> = vi.fn(),
) {
  return render(
    <AuthContext.Provider value={makeAuthValue()}>
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/admin" element={<AdminPage postQueries={{ list }} postCommands={{ remove }} />} />
          <Route path="/admin/posts/:postId/edit" element={<p>Pagina de Edicao</p>} />
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

async function openDeleteDialogFor(postTitle: string) {
  fireEvent.click(await screen.findByRole('button', { name: new RegExp(`excluir ${postTitle}`, 'i') }))
}

test('mostra o carregamento antes da lista chegar', () => {
  renderPage(() => new Promise(() => {}))

  expect(screen.getByRole('status')).toHaveTextContent('Carregando posts...')
})

test('mostra o subtitulo explicando que sao os posts do usuario', () => {
  renderPage(() => new Promise(() => {}))

  expect(
    screen.getByText('Seus posts. Só você pode editar e excluir estes conteúdos.'),
  ).toBeInTheDocument()
})

test('lista so os posts do usuario logado', async () => {
  renderPage(vi.fn().mockResolvedValue([ownPost, otherPost]))

  expect(await screen.findByText('Post proprio')).toBeInTheDocument()
  expect(screen.queryByText('Post de outro')).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: /excluir post proprio/i })).toBeInTheDocument()
})

test('sem posts proprios mostra o estado vazio com link para criar o primeiro', async () => {
  renderPage(vi.fn().mockResolvedValue([otherPost]))

  expect(await screen.findByText('Você ainda não publicou nenhum post.')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: '+ Criar o primeiro post' })).toHaveAttribute(
    'href',
    '/admin/posts/new',
  )
})

test('cancelar a exclusao nao altera a lista', async () => {
  renderPage(vi.fn().mockResolvedValue([ownPost]))

  await openDeleteDialogFor('post proprio')
  fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

  expect(screen.getByText('Post proprio')).toBeInTheDocument()
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

test('exclusao confirmada (204) remove o item e anuncia sucesso', async () => {
  const remove = vi.fn().mockResolvedValue(undefined)
  renderPage(vi.fn().mockResolvedValue([ownPost]), remove)

  await openDeleteDialogFor('post proprio')
  fireEvent.click(screen.getByRole('button', { name: 'Excluir' }))

  expect(await screen.findByText('Post excluído com sucesso.')).toBeInTheDocument()
  expect(screen.queryByText('Post proprio')).not.toBeInTheDocument()
  expect(remove).toHaveBeenCalledWith('post-1')
})

test('401 na exclusao mostra a mensagem de erro sem quebrar a pagina', async () => {
  const remove = vi.fn().mockRejectedValue(apiError(401, 'Sessao expirada.'))
  renderPage(vi.fn().mockResolvedValue([ownPost]), remove)

  await openDeleteDialogFor('post proprio')
  fireEvent.click(screen.getByRole('button', { name: 'Excluir' }))

  expect(await screen.findByText('Sessao expirada.')).toBeInTheDocument()
})

test('403 na exclusao mostra restricao especifica e recarrega a lista', async () => {
  const list = vi.fn().mockResolvedValue([ownPost])
  const remove = vi.fn().mockRejectedValue(apiError(403, 'Forbidden'))
  renderPage(list, remove)

  await openDeleteDialogFor('post proprio')
  fireEvent.click(screen.getByRole('button', { name: 'Excluir' }))

  expect(
    await screen.findByText('Você não tem permissão para excluir este post.'),
  ).toBeInTheDocument()
  expect(list).toHaveBeenCalledTimes(2)
})

test('404 na exclusao informa que o post ja foi removido e recarrega a lista', async () => {
  const list = vi.fn().mockResolvedValue([ownPost])
  const remove = vi.fn().mockRejectedValue(apiError(404, 'Nao encontrado'))
  renderPage(list, remove)

  await openDeleteDialogFor('post proprio')
  fireEvent.click(screen.getByRole('button', { name: 'Excluir' }))

  expect(await screen.findByText('Este post já havia sido removido.')).toBeInTheDocument()
  expect(list).toHaveBeenCalledTimes(2)
})

test('falha de rede na exclusao mostra mensagem generica e mantem a lista', async () => {
  const remove = vi.fn().mockRejectedValue(new Error('Falha de rede.'))
  renderPage(vi.fn().mockResolvedValue([ownPost]), remove)

  await openDeleteDialogFor('post proprio')
  fireEvent.click(screen.getByRole('button', { name: 'Excluir' }))

  expect(await screen.findByText('Falha de rede.')).toBeInTheDocument()
  expect(screen.getByText('Post proprio')).toBeInTheDocument()
})

test('erro ao carregar a lista mostra retry, e tentar novamente recupera', async () => {
  const list = vi.fn().mockRejectedValueOnce(new Error('Falha ao carregar.'))
  list.mockResolvedValueOnce([ownPost])

  renderPage(list)

  expect(await screen.findByRole('alert')).toHaveTextContent('Falha ao carregar.')

  fireEvent.click(screen.getByRole('button', { name: /tentar novamente/i }))

  expect(await screen.findByText('Post proprio')).toBeInTheDocument()
  expect(list).toHaveBeenCalledTimes(2)
})

test('mostra o link "+ Novo post" apontando para o formulario de criacao', async () => {
  renderPage(vi.fn().mockResolvedValue([ownPost]))

  expect(await screen.findByRole('link', { name: '+ Novo post' })).toHaveAttribute(
    'href',
    '/admin/posts/new',
  )
})

test('editar navega para a pagina de edicao do post', async () => {
  renderPage(vi.fn().mockResolvedValue([ownPost]))

  fireEvent.click(await screen.findByRole('button', { name: /editar post proprio/i }))

  expect(await screen.findByText('Pagina de Edicao')).toBeInTheDocument()
})
