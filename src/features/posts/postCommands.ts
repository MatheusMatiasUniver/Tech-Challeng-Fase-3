import { httpClient, type HttpClient } from '../../services/httpClient'
import type { CreatePostInput, Post, UpdatePostInput } from '../../types/api'

export function createPostCommands(client: HttpClient = httpClient) {
  return {
    create(input: CreatePostInput): Promise<Post> {
      return client.post<Post>('/posts', {
        title: input.title,
        content: input.content,
      })
    },

    update(id: string, input: UpdatePostInput): Promise<Post> {
      const body: UpdatePostInput = {}
      if (input.title !== undefined) {
        body.title = input.title
      }
      if (input.content !== undefined) {
        body.content = input.content
      }

      return client.put<Post>(`/posts/${id}`, body)
    },

    remove(id: string): Promise<void> {
      return client.delete(`/posts/${id}`)
    },
  }
}

export const postCommands = createPostCommands()
