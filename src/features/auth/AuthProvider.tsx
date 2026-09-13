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
      getAccessToken: () => getSession()?.accessToken,
      onUnauthorized: logout,
    })
  }, [logout])

  const value = useMemo<AuthContextValue>(
    () => ({ session, isAuthenticated: session !== null, login, logout }),
    [session, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
