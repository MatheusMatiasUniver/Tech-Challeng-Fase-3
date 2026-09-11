import axios, { AxiosError, isAxiosError, type AxiosAdapter } from 'axios'
import { apiBaseUrl } from '../config/env'
import type { ApiError } from '../types/api'

export type HttpClientOptions = {
  getAccessToken?: () => string | null | undefined
  onUnauthorized?: () => void
  adapter?: AxiosAdapter
}

export type HttpClient = ReturnType<typeof createHttpClient>

export function createHttpClient(options: HttpClientOptions = {}) {
  const instance = axios.create({
    baseURL: apiBaseUrl,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    ...(options.adapter ? { adapter: options.adapter } : {}),
  })

  instance.interceptors.request.use((config) => {
    const token = options.getAccessToken?.()
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`)
    }
    return config
  })

  instance.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      const apiError = normalizeError(error)

      if (apiError.status === 401 && requestHadBearer(error)) {
        options.onUnauthorized?.()
      }

      return Promise.reject(toThrown(apiError))
    },
  )

  return {
    async get<T>(path: string): Promise<T> {
      const { data } = await instance.get<T>(path)
      return data
    },
    async post<T>(path: string, body?: unknown): Promise<T> {
      const { data } = await instance.post<T>(path, body)
      return data
    },
    async put<T>(path: string, body?: unknown): Promise<T> {
      const { data } = await instance.put<T>(path, body)
      return data
    },
    async delete(path: string): Promise<void> {
      await instance.delete(path)
    },
  }
}

export const httpClient = createHttpClient()

function requestHadBearer(error: unknown): boolean {
  if (!isAxiosError(error) || !error.config?.headers) {
    return false
  }

  const authorization = error.config.headers.get('Authorization')
  return typeof authorization === 'string' && authorization.startsWith('Bearer ')
}

function toThrown(error: ApiError): Error & ApiError {
  const thrown = new Error(error.message) as Error & ApiError
  thrown.status = error.status
  thrown.cause = error.cause
  return thrown
}

function normalizeError(error: unknown): ApiError {
  if (!isAxiosError(error)) {
    return {
      status: null,
      message: error instanceof Error ? error.message : 'Erro inesperado.',
      cause: error,
    }
  }

  if (error.response) {
    const payload = error.response.data
    const message =
      payload &&
      typeof payload === 'object' &&
      'message' in payload &&
      typeof payload.message === 'string'
        ? payload.message
        : `Erro ${error.response.status}`

    return { status: error.response.status, message, cause: error }
  }

  if (error.code === AxiosError.ERR_BAD_RESPONSE) {
    return {
      status: null,
      message: 'Resposta inválida do servidor.',
      cause: error,
    }
  }

  return {
    status: null,
    message: 'Falha de rede. Tente novamente.',
    cause: error,
  }
}
