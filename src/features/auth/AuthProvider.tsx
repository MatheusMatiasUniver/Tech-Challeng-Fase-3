import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { configureHttpClient } from '../../services/httpClient'
import type { AuthSession, LoginCredentials } from '../../types/api'
import { AuthContext, type AuthContextValue } from './auth-context'
import { authService as defaultAuthService } from './auth.service'
import { clearSession, getSession } from './session'

interface AuthServiceLike {
  login: (credentials: LoginCredentials) => Promise<AuthSession>
}

export interface AuthProviderProps {
  children: ReactNode
  authService?: AuthServiceLike
}

export function AuthProvider({ children, authService = defaultAuthService }: AuthProviderProps) {
  const [session, setSession] = useState<AuthSession | null>(() => getSession())

  const logout = useCallback(() => {
    clearSession()
    setSession(null)
  }, [])

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const newSession = await authService.login(credentials)
      setSession(newSession)
    },
    [authService],
  )

  useEffect(() => {
    configureHttpClient({
      getAccessToken: () => {
        const currentSession = getSession()
        if (!currentSession) logout()
        return currentSession?.accessToken
      },
      onUnauthorized: logout,
    })
  }, [logout])

  useEffect(() => {
    if (!session) return

    const expiresAt = session.expiresAt
    let timer: ReturnType<typeof setTimeout>
    function checkExpiration() {
      const remaining = expiresAt - Date.now()
      if (remaining <= 0) {
        logout()
      } else {
        // Limita cada espera ao maior intervalo aceito pelo navegador.
        timer = setTimeout(checkExpiration, Math.min(remaining, 2_147_483_647))
      }
    }

    timer = setTimeout(checkExpiration, 0)
    return () => clearTimeout(timer)
  }, [session, logout])

  const value = useMemo<AuthContextValue>(
    () => ({ session, isAuthenticated: session !== null, login, logout }),
    [session, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
