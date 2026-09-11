import { AxiosError, type AxiosAdapter } from 'axios'
import { beforeEach, expect, test } from 'vitest'
import { createHttpClient } from '../../services/httpClient'
import { createAuthService } from './auth.service'

const STORAGE_KEY = 'auth_token'

beforeEach(() => {
  sessionStorage.clear()
})

function makeToken(payload: unknown): string {
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = base64UrlEncode(JSON.stringify(payload))
  return `${header}.${body}.signature`
}

function base64UrlEncode(input: string): string {
  return btoa(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function futureExp(seconds = 3600): number {
  return Math.floor(Date.now() / 1000) + seconds
}

function jsonAdapter(status: number, data: unknown): AxiosAdapter {
  return async (config) => ({
    data,
    status,
    statusText: 'OK',
    headers: { 'content-type': 'application/json' },
    config,
  })
}

function httpErrorAdapter(status: number, data: unknown, code: string): AxiosAdapter {
  return async (config) => {
    throw new AxiosError('Request failed', code, config, undefined, {
      status,
      statusText: 'Error',
      data,
      headers: {},
      config,
    })
  }
}

test('login envia exatamente { email, password } para /auth/login', async () => {
  const token = makeToken({ sub: 'user-1', exp: futureExp() })
  let capturedPath: string | undefined
  let capturedBody: unknown

  const client = createHttpClient({
    adapter: async (config) => {
      capturedPath = config.url
      capturedBody = JSON.parse(config.data as string)
      return {
        data: { access_token: token, token_type: 'Bearer' },
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
        config,
      }
    },
  })

  await createAuthService(client).login({
    email: 'professor@exemplo.com',
    password: 'segredo',
  })

  expect(capturedPath).toBe('/auth/login')
  expect(capturedBody).toEqual({
    email: 'professor@exemplo.com',
    password: 'segredo',
  })
})

test('login bem-sucedido guarda a sessao e devolve os dados do token', async () => {
  const token = makeToken({ sub: 'user-2', exp: futureExp() })
  const client = createHttpClient({
    adapter: jsonAdapter(200, { access_token: token, token_type: 'Bearer' }),
  })

  const session = await createAuthService(client).login({
    email: 'professor@exemplo.com',
    password: 'segredo',
  })

  expect(session.userId).toBe('user-2')
  expect(session.accessToken).toBe(token)
  expect(sessionStorage.getItem(STORAGE_KEY)).toBe(token)
})

test('login com credenciais rejeitadas propaga o erro da API e nao guarda sessao', async () => {
  const client = createHttpClient({
    adapter: httpErrorAdapter(401, { message: 'Credenciais invalidas' }, 'ERR_BAD_REQUEST'),
  })

  await expect(
    createAuthService(client).login({
      email: 'professor@exemplo.com',
      password: 'errada',
    }),
  ).rejects.toMatchObject({ status: 401, message: 'Credenciais invalidas' })

  expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull()
})

test('login rejeita resposta sem token valido e nao guarda sessao', async () => {
  const client = createHttpClient({
    adapter: jsonAdapter(200, { access_token: 'nao-e-um-jwt', token_type: 'Bearer' }),
  })

  await expect(
    createAuthService(client).login({
      email: 'professor@exemplo.com',
      password: 'segredo',
    }),
  ).rejects.toThrow(/invalid/i)

  expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull()
})
