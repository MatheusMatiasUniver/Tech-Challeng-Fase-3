import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import * as httpClientModule from '../../services/httpClient'
import { AuthProvider } from './AuthProvider'
import { saveSession } from './session'
import { useAuth } from './useAuth'

const STORAGE_KEY = 'auth_token'

beforeEach(() => {
  sessionStorage.clear()
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

test('encerra a sessao quando o token expira com a pagina aberta', () => {
  vi.useFakeTimers()
  saveSession(makeToken({ sub: 'user-1', exp: futureExp(60) }), 'prof@escola.com')
  render(<AuthProvider><TestConsumer /></AuthProvider>)

  act(() => vi.advanceTimersByTime(60_000))

  expect(screen.getByText('visitante')).toBeInTheDocument()
  expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull()
  expect(sessionStorage.getItem('auth_email')).toBeNull()
})

test('sincroniza a sessao ao pedir token se o temporizador ainda nao executou', () => {
  vi.useFakeTimers()
  const configureSpy = vi.spyOn(httpClientModule, 'configureHttpClient')
  saveSession(makeToken({ sub: 'user-1', exp: futureExp(60) }))
  render(<AuthProvider><TestConsumer /></AuthProvider>)
  const options = configureSpy.mock.calls.at(-1)![0]

  vi.setSystemTime(Date.now() + 60_000)
  act(() => {
    expect(options.getAccessToken?.()).toBeUndefined()
  })

  expect(screen.getByText('visitante')).toBeInTheDocument()
  expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull()
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

function pastExp(seconds = 3600): number {
  return Math.floor(Date.now() / 1000) - seconds
}

function TestConsumer() {
  const { session, isAuthenticated, login, logout } = useAuth()

  return (
    <div>
      <p>{isAuthenticated ? 'logado' : 'visitante'}</p>
      <p>{session?.userId ?? 'sem-usuario'}</p>
      <button onClick={() => login({ email: 'prof@escola.com', password: 'segredo' })}>
        Entrar
      </button>
      <button onClick={logout}>Sair</button>
    </div>
  )
}

test('restaura uma sessao valida ja existente no sessionStorage', () => {
  const token = makeToken({ sub: 'user-1', exp: futureExp() })
  sessionStorage.setItem(STORAGE_KEY, token)

  render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>,
  )

  expect(screen.getByText('logado')).toBeInTheDocument()
  expect(screen.getByText('user-1')).toBeInTheDocument()
})

test('nao restaura uma sessao expirada e limpa o storage', () => {
  const token = makeToken({ sub: 'user-1', exp: pastExp() })
  sessionStorage.setItem(STORAGE_KEY, token)

  render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>,
  )

  expect(screen.getByText('visitante')).toBeInTheDocument()
  expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull()
})

test('sem sessao no storage, comeca como visitante', () => {
  render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>,
  )

  expect(screen.getByText('visitante')).toBeInTheDocument()
})

test('login atualiza o estado e persiste a sessao no storage', async () => {
  const token = makeToken({ sub: 'user-2', exp: futureExp() })
  const fakeAuthService = { login: vi.fn(async () => saveSession(token)!) }

  render(
    <AuthProvider authService={fakeAuthService}>
      <TestConsumer />
    </AuthProvider>,
  )

  fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))

  expect(await screen.findByText('logado')).toBeInTheDocument()
  expect(screen.getByText('user-2')).toBeInTheDocument()
  expect(sessionStorage.getItem(STORAGE_KEY)).toBe(token)
})

test('logout limpa o estado e o storage', () => {
  const token = makeToken({ sub: 'user-1', exp: futureExp() })
  sessionStorage.setItem(STORAGE_KEY, token)

  render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>,
  )

  fireEvent.click(screen.getByRole('button', { name: 'Sair' }))

  expect(screen.getByText('visitante')).toBeInTheDocument()
  expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull()
})

test('401 protegido invalida a sessao via configureHttpClient', async () => {
  const configureSpy = vi.spyOn(httpClientModule, 'configureHttpClient')
  const token = makeToken({ sub: 'user-1', exp: futureExp() })
  sessionStorage.setItem(STORAGE_KEY, token)

  render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>,
  )

  expect(screen.getByText('logado')).toBeInTheDocument()

  const lastCall = configureSpy.mock.calls.at(-1)?.[0]
  lastCall?.onUnauthorized?.()

  expect(await screen.findByText('visitante')).toBeInTheDocument()
  expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull()

  configureSpy.mockRestore()
})

test('useAuth fora do AuthProvider lanca um erro', () => {
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

  expect(() => render(<TestConsumer />)).toThrow(/AuthProvider/)

  consoleError.mockRestore()
})
