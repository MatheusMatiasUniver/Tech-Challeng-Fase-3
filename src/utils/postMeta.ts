import type { Post } from '../types/api'
import { formatDate } from './formatDate'

export function formatPostMeta(post: Post): string {
  const authorName = post.author?.name ?? 'Autor não informado'
  const published = `Por ${authorName} · publicado em ${formatDate(post.createdAt)}`

  if (post.updatedAt === post.createdAt) {
    return published
  }

  return `${published} · atualizado em ${formatDate(post.updatedAt)}`
}
