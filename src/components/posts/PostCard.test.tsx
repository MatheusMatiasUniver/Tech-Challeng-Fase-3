import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { expect, test } from 'vitest'
import { PostCard } from './PostCard'
import type { Post } from '../../types/api'

const basePost: Post = {
  id: 'post-1',
  title: 'Introducao a React',
  content: 'Conteudo do post sobre React e seus fundamentos.',
  authorId: 'user-1',
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
  author: { id: 'user-1', name: 'Professor Ana', email: 'ana@escola.com' },
}

function renderCard(post: Post) {
  return render(
    <MemoryRouter>
      <PostCard post={post} />
    </MemoryRouter>,
  )
}

test('mostra titulo, autor e resumo do post', () => {
  renderCard(basePost)

  expect(screen.getByText('Introducao a React')).toBeInTheDocument()
  expect(screen.getByText('Professor Ana')).toBeInTheDocument()
  expect(screen.getByText('Conteudo do post sobre React e seus fundamentos.')).toBeInTheDocument()
})

test('o link tem nome acessivel com o titulo e aponta para /posts/:id', () => {
  renderCard(basePost)

  const link = screen.getByRole('link', { name: /ler o post introducao a react/i })
  expect(link).toHaveAttribute('href', '/posts/post-1')
})

test('sem author, mostra o fallback "Autor nao informado"', () => {
  const postSemAutor: Post = { ...basePost, author: undefined }
  renderCard(postSemAutor)

  expect(screen.getByText('Autor não informado')).toBeInTheDocument()
})

test('o email do autor nunca aparece no card', () => {
  renderCard(basePost)

  expect(screen.queryByText('ana@escola.com')).not.toBeInTheDocument()
})
