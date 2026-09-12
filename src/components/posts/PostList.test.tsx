import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { expect, test } from 'vitest'
import { PostList } from './PostList'
import type { Post } from '../../types/api'

function makePost(id: string, title: string): Post {
  return {
    id,
    title,
    content: `Conteudo do post ${title}.`,
    authorId: 'user-1',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
  }
}

test('renderiza cada post uma vez, preservando a ordem recebida', () => {
  const posts = [makePost('1', 'Primeiro'), makePost('2', 'Segundo'), makePost('3', 'Terceiro')]

  render(
    <MemoryRouter>
      <PostList posts={posts} />
    </MemoryRouter>,
  )

  const items = screen.getAllByRole('listitem')
  expect(items).toHaveLength(3)
  expect(items.map((item) => item.textContent)).toEqual([
    expect.stringContaining('Primeiro'),
    expect.stringContaining('Segundo'),
    expect.stringContaining('Terceiro'),
  ])
})

test('a marcacao e anunciada como lista', () => {
  render(
    <MemoryRouter>
      <PostList posts={[makePost('1', 'Primeiro')]} />
    </MemoryRouter>,
  )

  expect(screen.getByRole('list', { name: 'Lista de posts' })).toBeInTheDocument()
})

test('lista vazia nao renderiza itens', () => {
  render(
    <MemoryRouter>
      <PostList posts={[]} />
    </MemoryRouter>,
  )

  expect(screen.queryAllByRole('listitem')).toHaveLength(0)
})
