import type { AuthSession } from '../../types/api'

const STORAGE_KEY = 'auth_token'

interface JwtPayload {
  sub?: unknown
  exp?: unknown
}

export function saveSession(accessToken: string): AuthSession | null {
  const session = parseToken(accessToken)
  if (!session) {
    return null
  }

  sessionStorage.setItem(STORAGE_KEY, accessToken)
  return session
}

export function getSession(): AuthSession | null {
  const token = sessionStorage.getItem(STORAGE_KEY)
  if (!token) {
    return null
  }

  const session = parseToken(token)
  if (!session) {
    sessionStorage.removeItem(STORAGE_KEY)
    return null
  }

  return session
}

export function clearSession(): void {
  sessionStorage.removeItem(STORAGE_KEY)
}

function parseToken(token: string): AuthSession | null {
  const payload = decodePayload(token)
  if (!payload) {
    return null
  }

  const { sub, exp } = payload
  if (typeof sub !== 'string' || sub.length === 0) {
    return null
  }
  if (typeof exp !== 'number' || !Number.isFinite(exp)) {
    return null
  }

  const expiresAt = exp * 1000
  if (expiresAt <= Date.now()) {
    return null
  }

  return {
    accessToken: token,
    tokenType: 'Bearer',
    userId: sub,
    expiresAt,
  }
}

function decodePayload(token: string): JwtPayload | null {
  const parts = token.split('.')
  if (parts.length !== 3) {
    return null
  }

  try {
    const json = base64UrlDecode(parts[1])
    const parsed: unknown = JSON.parse(json)
    if (typeof parsed !== 'object' || parsed === null) {
      return null
    }
    return parsed as JwtPayload
  } catch {
    return null
  }
}

function base64UrlDecode(segment: string): string {
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/')
  const padding = (4 - (base64.length % 4)) % 4
  return atob(base64 + '='.repeat(padding))
}
