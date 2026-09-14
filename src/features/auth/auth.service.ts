import { httpClient, type HttpClient } from '../../services/httpClient'
import type { AuthSession, LoginCredentials, LoginResponse } from '../../types/api'
import { saveSession } from './session'

export function createAuthService(client: HttpClient = httpClient) {
  return {
    async login(credentials: LoginCredentials): Promise<AuthSession> {
      const response = await client.post<LoginResponse>('/auth/login', {
        email: credentials.email,
        password: credentials.password,
      })

      const session = saveSession(response.access_token, credentials.email)
      if (!session) {
        throw new Error('Resposta de login invalida: token ausente ou malformado.')
      }

      return session
    },
  }
}

export const authService = createAuthService()
