import type { AuthSession } from '../../types/api'

const STORAGE_KEY = 'auth_token'
const EMAIL_STORAGE_KEY = 'auth_email'

interface JwtPayload {
  sub?: unknown
  exp?: unknown
}

export function saveSession(accessToken: string, email?: string): AuthSession | null {
  const session = parseToken(accessToken)
  if (!session) {
    return null
  }

  sessionStorage.setItem(STORAGE_KEY, accessToken)
  if (email) {
    sessionStorage.setItem(EMAIL_STORAGE_KEY, email)
    return { ...session, email }
  }

  sessionStorage.removeItem(EMAIL_STORAGE_KEY)
  return session
}

export function getSession(): AuthSession | null {
  const token = sessionStorage.getItem(STORAGE_KEY)
  if (!token) {
    return null
  }

  const session = parseToken(token)
  if (!session) {
    clearSession()
    return null
  }

  const email = sessionStorage.getItem(EMAIL_STORAGE_KEY)
  return email ? { ...session, email } : session
}

export function clearSession(): void {
  sessionStorage.removeItem(STORAGE_KEY)
  sessionStorage.removeItem(EMAIL_STORAGE_KEY)
}

export function getDisplayName(session: AuthSession | null): string {
  const localPart = session?.email?.split('@')[0]
  return localPart || '—'
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
