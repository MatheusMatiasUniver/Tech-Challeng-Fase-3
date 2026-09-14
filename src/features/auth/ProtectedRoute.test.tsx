import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useSearchParams } from 'react-router-dom'
import { expect, test, vi } from 'vitest'
import { AuthContext, type AuthContextValue } from './auth-context'
import { ProtectedRoute } from './ProtectedRoute'

function makeAuthValue(isAuthenticated: boolean): AuthContextValue {
  return {
    session: isAuthenticated
      ? { accessToken: 'token', tokenType: 'Bearer', userId: 'user-1', expiresAt: Date.now() + 60_000 }
      : null,
    isAuthenticated,
    login: vi.fn(),
    logout: vi.fn(),
  }
}

function LoginStub() {
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect')
  return <p>Login Page - destino: {redirect ?? 'nenhum'}</p>
}

function renderApp(isAuthenticated: boolean, initialEntry: string) {
  return render(
    <AuthContext.Provider value={makeAuthValue(isAuthenticated)}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/login" element={<LoginStub />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<p>Pagina Admin</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

test('visitante e redirecionado para /login', () => {
  renderApp(false, '/admin')

  expect(screen.getByText(/login page/i)).toBeInTheDocument()
  expect(screen.queryByText('Pagina Admin')).not.toBeInTheDocument()
})

test('usuario autenticado renderiza a rota filha (Outlet)', () => {
  renderApp(true, '/admin')

  expect(screen.getByText('Pagina Admin')).toBeInTheDocument()
})

test('o destino pretendido (path + query) e preservado no redirect', () => {
  renderApp(false, '/admin?tab=meus-posts')

  expect(screen.getByText('Login Page - destino: /admin?tab=meus-posts')).toBeInTheDocument()
})

test('o destino preservado e sempre um caminho relativo, nunca uma URL absoluta', () => {
  renderApp(false, '/admin')

  const text = screen.getByText(/login page/i).textContent ?? ''
  const from = text.replace('Login Page - destino: ', '')

  expect(from.startsWith('/')).toBe(true)
  expect(from).not.toMatch(/^https?:\/\//)
  expect(from).not.toMatch(/^\/\//)
})
