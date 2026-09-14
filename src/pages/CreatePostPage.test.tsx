import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { expect, test, vi } from 'vitest'
import { AuthContext, type AuthContextValue } from '../features/auth/auth-context'
import { CreatePostPage } from './CreatePostPage'
import type { Post } from '../types/api'

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

function renderPage(create: (input: { title: string; content: string }) => Promise<Post>) {
  return render(
    <AuthContext.Provider value={makeAuthValue()}>
      <MemoryRouter initialEntries={['/admin/posts/new']}>
        <Routes>
          <Route path="/admin/posts/new" element={<CreatePostPage postCommands={{ create }} />} />
          <Route path="/posts/:postId" element={<p>Pagina do Post</p>} />
          <Route path="/admin" element={<p>Pagina Admin</p>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

function fillAndSubmit(title: string, content: string) {
  fireEvent.change(screen.getByLabelText('Título'), { target: { value: title } })
  fireEvent.change(screen.getByLabelText('Conteúdo'), { target: { value: content } })
  fireEvent.click(screen.getByRole('button', { name: /salvar/i }))
}

function apiError(status: number, message: string) {
  const error = new Error(message) as Error & { status: number }
  error.status = status
  return error
}

test('mostra link "Voltar para a administracao" apontando pro admin', () => {
  renderPage(vi.fn())

  expect(
    screen.getByRole('link', { name: /voltar para a administração/i }),
  ).toHaveAttribute('href', '/admin')
})

test('clicar em "Cancelar" navega para a administracao', () => {
  renderPage(vi.fn())

  fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

  expect(screen.getByText('Pagina Admin')).toBeInTheDocument()
})

test('mostra a parte antes do "@" do e-mail da sessao como autor, sem campo editavel', () => {
  renderPage(vi.fn())

  expect(screen.getByText('Publicando como: professor')).toBeInTheDocument()
  expect(screen.queryByLabelText(/autor/i)).not.toBeInTheDocument()
})

const CREATED_POST = {
  id: 'novo-post-1',
  title: 'Titulo',
  content: 'Conteudo',
  authorId: 'user-1',
  createdAt: '2026-09-13T00:00:00.000Z',
  updatedAt: '2026-09-13T00:00:00.000Z',
} satisfies Post

test('sucesso mostra o dialogo de confirmacao, sem navegar sozinho', async () => {
  const create = vi.fn().mockResolvedValue(CREATED_POST)
  renderPage(create)

  fillAndSubmit('Titulo', 'Conteudo')

  expect(await screen.findByRole('dialog')).toHaveTextContent('Post criado com sucesso!')
  expect(screen.getByText('“Titulo” já está disponível para os leitores.')).toBeInTheDocument()
  expect(screen.queryByText('Pagina do Post')).not.toBeInTheDocument()
  expect(create).toHaveBeenCalledWith({ title: 'Titulo', content: 'Conteudo' })
})

test('"Ver post" navega para a pagina do post criado', async () => {
  renderPage(vi.fn().mockResolvedValue(CREATED_POST))

  fillAndSubmit('Titulo', 'Conteudo')
  fireEvent.click(await screen.findByRole('button', { name: 'Ver post' }))

  expect(screen.getByText('Pagina do Post')).toBeInTheDocument()
})

test('"Voltar à administração" no dialogo navega pro admin', async () => {
  renderPage(vi.fn().mockResolvedValue(CREATED_POST))

  fillAndSubmit('Titulo', 'Conteudo')
  fireEvent.click(await screen.findByRole('button', { name: 'Voltar à administração' }))

  expect(screen.getByText('Pagina Admin')).toBeInTheDocument()
})

test('"Criar outro" fecha o dialogo e limpa o formulario, sem sair da tela', async () => {
  renderPage(vi.fn().mockResolvedValue(CREATED_POST))

  fillAndSubmit('Titulo', 'Conteudo')
  fireEvent.click(await screen.findByRole('button', { name: 'Criar outro' }))

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(screen.getByLabelText('Título')).toHaveValue('')
  expect(screen.getByLabelText('Conteúdo')).toHaveValue('')
  expect(screen.getByRole('heading', { name: 'Criar post' })).toBeInTheDocument()
})

test('campos vazios nao chamam create', () => {
  const create = vi.fn()
  renderPage(create)

  fireEvent.click(screen.getByRole('button', { name: /salvar/i }))

  expect(create).not.toHaveBeenCalled()
})

test('erro 400 mostra a mensagem e mantem os dados no formulario', async () => {
  const create = vi.fn().mockRejectedValue(apiError(400, 'Titulo invalido.'))
  renderPage(create)

  fillAndSubmit('Titulo', 'Conteudo')

  expect(await screen.findByText('Titulo invalido.')).toBeInTheDocument()
  expect(screen.getByLabelText('Título')).toHaveValue('Titulo')
  expect(screen.getByLabelText('Conteúdo')).toHaveValue('Conteudo')
})

test('erro 401 (sessao invalidada) tambem mostra mensagem, sem navegar', async () => {
  const create = vi.fn().mockRejectedValue(apiError(401, 'Sessao expirada.'))
  renderPage(create)

  fillAndSubmit('Titulo', 'Conteudo')

  expect(await screen.findByText('Sessao expirada.')).toBeInTheDocument()
  expect(screen.queryByText('Pagina do Post')).not.toBeInTheDocument()
})

test('falha de rede mostra mensagem generica', async () => {
  const create = vi.fn().mockRejectedValue(new Error('Falha de rede.'))
  renderPage(create)

  fillAndSubmit('Titulo', 'Conteudo')

  expect(await screen.findByText('Falha de rede.')).toBeInTheDocument()
})
