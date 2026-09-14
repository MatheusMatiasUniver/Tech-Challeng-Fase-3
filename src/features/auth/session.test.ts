import { beforeEach, expect, test } from 'vitest'
import { clearSession, getDisplayName, getSession, saveSession } from './session'

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

function pastExp(seconds = 3600): number {
  return Math.floor(Date.now() / 1000) - seconds
}

test('saveSession aceita token valido, guarda no sessionStorage e devolve a sessao', () => {
  const token = makeToken({ sub: 'user-1', exp: futureExp() })

  const session = saveSession(token)

  expect(session).not.toBeNull()
  expect(session?.userId).toBe('user-1')
  expect(session?.accessToken).toBe(token)
  expect(sessionStorage.getItem(STORAGE_KEY)).toBe(token)
})

test('getSession restaura uma sessao valida gravada anteriormente', () => {
  const token = makeToken({ sub: 'user-2', exp: futureExp() })
  sessionStorage.setItem(STORAGE_KEY, token)

  const session = getSession()

  expect(session).toEqual({
    accessToken: token,
    tokenType: 'Bearer',
    userId: 'user-2',
    expiresAt: expect.any(Number),
  })
})

test('getSession devolve null e limpa o storage quando o token esta expirado', () => {
  const token = makeToken({ sub: 'user-3', exp: pastExp() })
  sessionStorage.setItem(STORAGE_KEY, token)

  const session = getSession()

  expect(session).toBeNull()
  expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull()
})

test('getSession devolve null quando o token nao tem "sub"', () => {
  const token = makeToken({ exp: futureExp() })
  sessionStorage.setItem(STORAGE_KEY, token)

  expect(getSession()).toBeNull()
})

test('getSession devolve null quando o token nao tem "exp"', () => {
  const token = makeToken({ sub: 'user-4' })
  sessionStorage.setItem(STORAGE_KEY, token)

  expect(getSession()).toBeNull()
})

test('getSession devolve null quando o token esta malformado', () => {
  sessionStorage.setItem(STORAGE_KEY, 'isso-nao-e-um-jwt')

  expect(getSession()).toBeNull()
})

test('getSession devolve null quando nao ha sessao guardada', () => {
  expect(getSession()).toBeNull()
})

test('clearSession remove o token e getSession passa a devolver null', () => {
  const token = makeToken({ sub: 'user-5', exp: futureExp() })
  saveSession(token)

  clearSession()

  expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull()
  expect(getSession()).toBeNull()
})

test('saveSession com e-mail guarda o e-mail e getSession o devolve junto com a sessao', () => {
  const token = makeToken({ sub: 'user-6', exp: futureExp() })

  expect(saveSession(token, 'professor@exemplo.com')?.email).toBe('professor@exemplo.com')
  expect(getSession()?.email).toBe('professor@exemplo.com')
})

test('clearSession tambem remove o e-mail guardado', () => {
  saveSession(makeToken({ sub: 'user-7', exp: futureExp() }), 'professor@exemplo.com')

  clearSession()

  expect(sessionStorage.getItem('auth_email')).toBeNull()
})

test('token expirado tambem descarta o e-mail guardado', () => {
  sessionStorage.setItem(STORAGE_KEY, makeToken({ sub: 'user-8', exp: pastExp() }))
  sessionStorage.setItem('auth_email', 'professor@exemplo.com')

  expect(getSession()).toBeNull()
  expect(sessionStorage.getItem('auth_email')).toBeNull()
})

test('getDisplayName mostra a parte antes do "@" do e-mail', () => {
  const session = saveSession(makeToken({ sub: 'user-9', exp: futureExp() }), 'ana.docente@fiap.com.br')

  expect(getDisplayName(session)).toBe('ana.docente')
})

test('getDisplayName sem e-mail (sessao antiga) ou sem sessao mostra "—"', () => {
  const session = saveSession(makeToken({ sub: 'user-10', exp: futureExp() }))

  expect(getDisplayName(session)).toBe('—')
  expect(getDisplayName(null)).toBe('—')
})
