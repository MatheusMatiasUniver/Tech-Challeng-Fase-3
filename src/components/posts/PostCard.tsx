import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { createExcerpt } from '../../utils/createExcerpt'
import type { Post } from '../../types/api'

export interface PostCardProps {
  post: Post
}

const Card = styled.article`
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const Title = styled.h3`
  margin: 0;
  font-size: 1.1rem;
`

const Author = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: var(--text);
`

const Excerpt = styled.p`
  margin: 0;
  color: var(--text);
`

const ReadLink = styled(Link)`
  align-self: flex-start;
  color: var(--accent);
  font-weight: 600;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

export function PostCard({ post }: PostCardProps) {
  const authorName = post.author?.name ?? 'Autor não informado'

  return (
    <Card>
      <Title>{post.title}</Title>
      <Author>{authorName}</Author>
      <Excerpt>{createExcerpt(post.content)}</Excerpt>
      <ReadLink to={`/posts/${post.id}`} aria-label={`Ler o post ${post.title}`}>
        Ler mais
      </ReadLink>
    </Card>
  )
}
