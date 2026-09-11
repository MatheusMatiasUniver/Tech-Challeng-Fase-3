import { httpClient, type HttpClient } from '../../services/httpClient'
import type { Post } from '../../types/api'

export function createPostQueries(client: HttpClient = httpClient) {
  return {
    list(): Promise<Post[]> {
      return client.get<Post[]>('/posts')
    },

    search(term: string): Promise<Post[]> {
      const trimmed = term.trim()
      if (!trimmed) {
        return Promise.resolve([])
      }

      return client.get<Post[]>(`/posts/search?q=${encodeURIComponent(trimmed)}`)
    },

    getById(id: string): Promise<Post> {
      return client.get<Post>(`/posts/${id}`)
    },
  }
}

export const postQueries = createPostQueries()
