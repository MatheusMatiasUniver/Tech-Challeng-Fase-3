import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { expect, test, vi } from 'vitest'
import { AdminPostList } from './AdminPostList'
import type { Post } from '../../types/api'

function makePost(id: string, title: string, authorId: string): Post {
  return {
    id,
    title,
    content: `Conteudo de ${title}.`,
    authorId,
    createdAt: '2026-09-01T15:00:00.000Z',
    updatedAt: '2026-09-01T15:00:00.000Z',
  }
}

const posts = [
  makePost('1', 'Post do professor Ana', 'user-ana'),
  { ...makePost('2', 'Post editado', 'user-ana'), updatedAt: '2026-09-05T15:00:00.000Z' },
]

function renderList(props: Partial<Parameters<typeof AdminPostList>[0]> = {}) {
  return render(
    <MemoryRouter>
      <AdminPostList
        posts={posts}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        {...props}
      />
    </MemoryRouter>,
  )
}

test('mostra titulo e a linha de autor e datas de cada post', () => {
  renderList()

  expect(screen.getByRole('heading', { name: 'Post do professor Ana' })).toBeInTheDocument()
  expect(screen.getByText('Por Autor não informado · publicado em 1 set 2026')).toBeInTheDocument()
  expect(
    screen.getByText('Por Autor não informado · publicado em 1 set 2026 · atualizado em 5 set 2026'),
  ).toBeInTheDocument()
})

test('todo post recebido tem Ver, Editar e Excluir', () => {
  renderList()

  for (const title of ['Post do professor Ana', 'Post editado']) {
    expect(screen.getByRole('link', { name: `Ver ${title}` })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: `Editar ${title}` })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: `Excluir ${title}` })).toBeInTheDocument()
  }
})

test('nao mostra mais o selo "Seu post"', () => {
  renderList()

  expect(screen.queryByText('Seu post')).not.toBeInTheDocument()
})

test('clicar em editar chama onEdit com o post correto', () => {
  const onEdit = vi.fn()
  renderList({ onEdit })

  fireEvent.click(screen.getByRole('button', { name: /editar post do professor ana/i }))

  expect(onEdit).toHaveBeenCalledWith(posts[0])
})

test('clicar em excluir chama onDelete com o post correto', () => {
  const onDelete = vi.fn()
  renderList({ onDelete })

  fireEvent.click(screen.getByRole('button', { name: /excluir post do professor ana/i }))

  expect(onDelete).toHaveBeenCalledWith(posts[0])
})

test('o link "Ver" aponta para a leitura do post certo', () => {
  renderList()

  expect(screen.getByRole('link', { name: 'Ver Post do professor Ana' })).toHaveAttribute('href', '/posts/1')
  expect(screen.getByRole('link', { name: 'Ver Post editado' })).toHaveAttribute('href', '/posts/2')
})
