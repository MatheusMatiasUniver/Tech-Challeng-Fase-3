export interface PostAuthor {
  id: string
  name: string
  email: string
}

export interface Post {
  id: string
  title: string
  content: string
  authorId: string
  createdAt: string
  updatedAt: string
  author?: PostAuthor
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  token_type: 'Bearer'
}

export interface AuthSession {
  accessToken: string
  tokenType: 'Bearer'
  userId: string
  expiresAt: number
  email?: string
}

export interface CreatePostInput {
  title: string
  content: string
}

export type UpdatePostInput = Partial<CreatePostInput>

export interface ApiError {
  status: number | null
  message: string
  cause?: unknown
}
