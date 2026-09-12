import { fireEvent, render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import { AdminPostList } from './AdminPostList'
import type { Post } from '../../types/api'

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

const posts = [
  makePost('1', 'Post do professor Ana', 'user-ana'),
  makePost('2', 'Post do professor Bruno', 'user-bruno'),
]

test('todos os posts permanecem visiveis, independente do autor', () => {
  render(
    <AdminPostList posts={posts} currentUserId="user-ana" onEdit={vi.fn()} onDelete={vi.fn()} />,
  )

  expect(screen.getByText('Post do professor Ana')).toBeInTheDocument()
  expect(screen.getByText('Post do professor Bruno')).toBeInTheDocument()
})

test('o post proprio e identificado com um selo', () => {
  render(
    <AdminPostList posts={posts} currentUserId="user-ana" onEdit={vi.fn()} onDelete={vi.fn()} />,
  )

  expect(screen.getByText('Seu post')).toBeInTheDocument()
})

test('acoes de editar/excluir nao aparecem para post de outro autor', () => {
  render(
    <AdminPostList posts={posts} currentUserId="user-ana" onEdit={vi.fn()} onDelete={vi.fn()} />,
  )

  expect(
    screen.queryByRole('button', { name: /editar post do professor bruno/i }),
  ).not.toBeInTheDocument()
  expect(
    screen.queryByRole('button', { name: /excluir post do professor bruno/i }),
  ).not.toBeInTheDocument()
})

test('acoes de editar/excluir aparecem para post proprio', () => {
  render(
    <AdminPostList posts={posts} currentUserId="user-ana" onEdit={vi.fn()} onDelete={vi.fn()} />,
  )

  expect(screen.getByRole('button', { name: /editar post do professor ana/i })).toBeInTheDocument()
  expect(
    screen.getByRole('button', { name: /excluir post do professor ana/i }),
  ).toBeInTheDocument()
})

test('clicar em editar chama onEdit com o post correto', () => {
  const onEdit = vi.fn()
  render(
    <AdminPostList posts={posts} currentUserId="user-ana" onEdit={onEdit} onDelete={vi.fn()} />,
  )

  fireEvent.click(screen.getByRole('button', { name: /editar post do professor ana/i }))

  expect(onEdit).toHaveBeenCalledWith(posts[0])
})

test('clicar em excluir chama onDelete com o post correto', () => {
  const onDelete = vi.fn()
  render(
    <AdminPostList posts={posts} currentUserId="user-ana" onEdit={vi.fn()} onDelete={onDelete} />,
  )

  fireEvent.click(screen.getByRole('button', { name: /excluir post do professor ana/i }))

  expect(onDelete).toHaveBeenCalledWith(posts[0])
})
