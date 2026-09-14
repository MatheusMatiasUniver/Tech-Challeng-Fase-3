import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { expect, test, vi } from 'vitest'
import { PostDetailPage } from './PostDetailPage'
import type { Post } from '../types/api'

const VALID_ID = '11111111-1111-1111-1111-111111111111'

const samplePost: Post = {
  id: VALID_ID,
  title: 'Introdução ao React',
  content: 'Conteudo completo do post.',
  authorId: 'user-1',
  createdAt: '2026-01-10T00:00:00.000Z',
  updatedAt: '2026-01-10T00:00:00.000Z',
  author: { id: 'user-1', name: 'Professor Ana', email: 'ana@escola.com' },
}

function renderAt(path: string, getById: (id: string) => Promise<Post>) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/posts/:postId" element={<PostDetailPage postQueries={{ getById }} />} />
        <Route path="/" element={<p>Pagina Home</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

function apiError(status: number, message: string) {
  const error = new Error(message) as Error & { status: number }
  error.status = status
  return error
}

test('mostra link "Voltar para a lista" apontando pra home', async () => {
  renderAt(`/posts/${VALID_ID}`, vi.fn().mockResolvedValue(samplePost))

  expect(await screen.findByRole('link', { name: /voltar para a lista/i })).toHaveAttribute(
    'href',
    '/',
  )
})

test('mostra titulo, autor, conteudo e datas, sem expor o email', async () => {
  renderAt(`/posts/${VALID_ID}`, vi.fn().mockResolvedValue(samplePost))

  expect(await screen.findByRole('heading', { name: 'Introdução ao React' })).toBeInTheDocument()
  expect(screen.getByText(/professor ana/i)).toBeInTheDocument()
  expect(screen.getByText('Conteudo completo do post.')).toBeInTheDocument()
  expect(screen.queryByText('ana@escola.com')).not.toBeInTheDocument()
})

test('mostra a data curta de publicacao e de atualizacao quando o post foi editado', async () => {
  const editado: Post = {
    ...samplePost,
    createdAt: '2026-08-12T15:00:00.000Z',
    updatedAt: '2026-08-29T15:00:00.000Z',
  }
  renderAt(`/posts/${VALID_ID}`, vi.fn().mockResolvedValue(editado))

  expect(
    await screen.findByText('Por Professor Ana · publicado em 12 ago 2026 · atualizado em 29 ago 2026'),
  ).toBeInTheDocument()
})

test('o link "Voltar para a lista" aparece tambem quando o post nao existe', async () => {
  renderAt(`/posts/${VALID_ID}`, vi.fn().mockRejectedValue(apiError(404, 'Post nao encontrado')))

  await screen.findByRole('alert')
  expect(screen.getByRole('link', { name: /voltar para a lista/i })).toHaveAttribute('href', '/')
})

test('mostra o carregamento antes do post chegar', () => {
  renderAt(`/posts/${VALID_ID}`, () => new Promise(() => {}))

  expect(screen.getByRole('status')).toHaveTextContent('Carregando post...')
})

test('sem author, mostra o fallback "Autor nao informado"', async () => {
  const postSemAutor: Post = { ...samplePost, author: undefined }
  renderAt(`/posts/${VALID_ID}`, vi.fn().mockResolvedValue(postSemAutor))

  expect(await screen.findByText(/autor não informado/i)).toBeInTheDocument()
})

test('UUID invalido nao chama a API e mostra "Post nao encontrado" com botao pra home', async () => {
  const getById = vi.fn()
  renderAt('/posts/nao-e-um-uuid', getById)

  const alert = await screen.findByRole('alert')
  expect(alert).toHaveTextContent('Post não encontrado')
  expect(getById).not.toHaveBeenCalled()
  expect(screen.getByRole('link', { name: /voltar para a página inicial/i })).toHaveAttribute(
    'href',
    '/',
  )
})

test('404 mostra mensagem de post nao encontrado e link de volta, sem retry', async () => {
  renderAt(`/posts/${VALID_ID}`, vi.fn().mockRejectedValue(apiError(404, 'Post nao encontrado')))

  const alert = await screen.findByRole('alert')
  expect(alert).toHaveTextContent('Post não encontrado')
  expect(alert).toHaveTextContent('Ele pode ter sido removido pelo autor.')
  expect(screen.getByRole('link', { name: /voltar para a página inicial/i })).toBeInTheDocument()
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
})

test('erro de rede mostra mensagem com retry, e tentar novamente recupera o post', async () => {
  const getById = vi.fn().mockRejectedValueOnce(new Error('Falha de rede.'))
  getById.mockResolvedValueOnce(samplePost)

  renderAt(`/posts/${VALID_ID}`, getById)

  expect(await screen.findByRole('alert')).toHaveTextContent('Falha de rede.')

  fireEvent.click(screen.getByRole('button', { name: /tentar novamente/i }))

  expect(await screen.findByRole('heading', { name: 'Introdução ao React' })).toBeInTheDocument()
  expect(getById).toHaveBeenCalledTimes(2)
})
