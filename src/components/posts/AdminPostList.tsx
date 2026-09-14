import { Link } from 'react-router-dom'
import styled from 'styled-components'
import type { Post } from '../../types/api'
import { formatPostMeta } from '../../utils/postMeta'

export interface AdminPostListProps {
  posts: Post[]
  onEdit: (post: Post) => void
  onDelete: (post: Post) => void
}

const List = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
`

const Row = styled.li`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 14px 20px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 20px 22px;
`

const Info = styled.div`
  flex: 1 1 320px;
  min-width: 0;
`

const Title = styled.h2`
  margin: 0;
  font-family: var(--sans);
  font-size: 19px;
  font-weight: 600;
  line-height: 1.3;
  text-wrap: pretty;
`

const Meta = styled.p`
  margin: 7px 0 0;
  font-size: 14px;
  color: var(--muted);
`

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

const buttonBase = `
  padding: 9px 15px;
  border-radius: 9px;
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
`

const ViewLink = styled(Link)`
  ${buttonBase}
  border: 1px solid var(--border-strong);
  color: var(--text);

  &:hover {
    border-color: var(--ink);
    color: var(--ink);
  }
`

const EditButton = styled.button`
  ${buttonBase}
  border: 1px solid var(--ink);
  background: var(--ink);
  color: var(--on-ink);

  &:hover {
    border-color: var(--accent);
    background: var(--accent);
  }
`

const DeleteButton = styled.button`
  ${buttonBase}
  border: 1px solid var(--accent-soft);
  background: none;
  color: var(--accent);

  &:hover {
    background: var(--error-bg);
  }
`

export function AdminPostList({ posts, onEdit, onDelete }: AdminPostListProps) {
  return (
    <List aria-label="Seus posts">
      {posts.map((post) => (
        <Row key={post.id}>
          <Info>
            <Title>{post.title}</Title>
            <Meta>{formatPostMeta(post)}</Meta>
          </Info>
          <Actions>
            <ViewLink to={`/posts/${post.id}`} aria-label={`Ver ${post.title}`}>
              Ver
            </ViewLink>
            <EditButton type="button" onClick={() => onEdit(post)} aria-label={`Editar ${post.title}`}>
              Editar
            </EditButton>
            <DeleteButton
              type="button"
              onClick={() => onDelete(post)}
              aria-label={`Excluir ${post.title}`}
            >
              Excluir
            </DeleteButton>
          </Actions>
        </Row>
      ))}
    </List>
  )
}
