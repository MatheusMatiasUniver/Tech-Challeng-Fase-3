import { expect, test } from 'vitest'
import type { Post } from '../types/api'
import { formatPostMeta } from './postMeta'

const post: Post = {
  id: 'post-1',
  title: 'Titulo',
  content: 'Conteudo.',
  authorId: 'user-1',
  createdAt: '2026-08-12T15:00:00.000Z',
  updatedAt: '2026-08-12T15:00:00.000Z',
  author: { id: 'user-1', name: 'Professor Ana', email: 'ana@escola.com' },
}

test('post nunca editado mostra so autor e data de publicacao', () => {
  expect(formatPostMeta(post)).toBe('Por Professor Ana · publicado em 12 ago 2026')
})

test('post editado acrescenta a data de atualizacao', () => {
  expect(formatPostMeta({ ...post, updatedAt: '2026-08-29T15:00:00.000Z' })).toBe(
    'Por Professor Ana · publicado em 12 ago 2026 · atualizado em 29 ago 2026',
  )
})

test('sem author, usa "Autor nao informado" e nunca expoe o e-mail', () => {
  const meta = formatPostMeta({ ...post, author: undefined })

  expect(meta).toBe('Por Autor não informado · publicado em 12 ago 2026')
  expect(formatPostMeta(post)).not.toContain('ana@escola.com')
})
