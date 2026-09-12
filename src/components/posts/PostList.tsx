import styled from 'styled-components'
import { PostCard } from './PostCard'
import type { Post } from '../../types/api'

export interface PostListProps {
  posts: Post[]
}

const List = styled.ul`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  margin: 0;
  padding: 0;
  list-style: none;
`

export function PostList({ posts }: PostListProps) {
  return (
    <List aria-label="Lista de posts">
      {posts.map((post) => (
        <li key={post.id}>
          <PostCard post={post} />
        </li>
      ))}
    </List>
  )
}
