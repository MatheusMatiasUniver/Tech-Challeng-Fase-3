import styled from 'styled-components'
import { PostCard } from './PostCard'
import type { Post } from '../../types/api'

export interface PostListProps {
  posts: Post[]
}

const List = styled.ul`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
  gap: 18px;
  margin: 0;
  padding: 0;
  list-style: none;
`

const Item = styled.li`
  display: flex;
`

export function PostList({ posts }: PostListProps) {
  return (
    <List aria-label="Lista de posts">
      {posts.map((post) => (
        <Item key={post.id}>
          <PostCard post={post} />
        </Item>
      ))}
    </List>
  )
}
