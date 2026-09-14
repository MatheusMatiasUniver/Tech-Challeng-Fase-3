import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { createExcerpt } from '../../utils/createExcerpt'
import type { Post } from '../../types/api'

export interface PostCardProps {
  post: Post
}

const Card = styled.article`
  width: 100%;
  box-sizing: border-box;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 26px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 14px 30px -22px rgba(22, 24, 29, 0.55);
    border-color: var(--ink);
  }
`

const Title = styled.h2`
  margin: 0;
  font-size: 27px;
  line-height: 1.15;
  letter-spacing: -0.01em;
  text-wrap: pretty;
`

const Author = styled.p`
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
`

const Excerpt = styled.p`
  margin: 0;
  font-size: 16px;
  line-height: 1.6;
  color: var(--text);
  text-wrap: pretty;
`

const ReadLink = styled(Link)`
  margin-top: auto;
  align-self: flex-start;
  padding: 6px 0;
  border-bottom: 1px solid var(--accent-soft);
  font-size: 15px;
  font-weight: 600;
  color: var(--accent);
  text-decoration: none;

  &:hover {
    color: var(--ink);
    border-color: var(--ink);
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 3px;
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
        Ler mais →
      </ReadLink>
    </Card>
  )
}
