import styled from 'styled-components'
import type { Post } from '../../types/api'

export interface AdminPostListProps {
  posts: Post[]
  currentUserId: string
  onEdit: (post: Post) => void
  onDelete: (post: Post) => void
}

const List = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
`

const Row = styled.li`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.75rem 1rem;
`

const Info = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
`

const Title = styled.span`
  font-weight: 600;
  color: var(--text-h);
`

const Badge = styled.span`
  align-self: flex-start;
  font-size: 0.75rem;
  color: var(--accent);
`

const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
`

const Button = styled.button`
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 0.4rem 0.75rem;
  font: inherit;
  cursor: pointer;
  background: transparent;
  color: var(--text-h);

  &:hover {
    border-color: var(--accent);
    color: var(--accent);
  }
`

export function AdminPostList({ posts, currentUserId, onEdit, onDelete }: AdminPostListProps) {
  return (
    <List aria-label="Posts (administração)">
      {posts.map((post) => {
        const isOwner = post.authorId === currentUserId

        return (
          <Row key={post.id}>
            <Info>
              <Title>{post.title}</Title>
              {isOwner ? <Badge>Seu post</Badge> : null}
            </Info>
            {isOwner ? (
              <Actions>
                <Button
                  type="button"
                  onClick={() => onEdit(post)}
                  aria-label={`Editar ${post.title}`}
                >
                  Editar
                </Button>
                <Button
                  type="button"
                  onClick={() => onDelete(post)}
                  aria-label={`Excluir ${post.title}`}
                >
                  Excluir
                </Button>
              </Actions>
            ) : null}
          </Row>
        )
      })}
    </List>
  )
}
