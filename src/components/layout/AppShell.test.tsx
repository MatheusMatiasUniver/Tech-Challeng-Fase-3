import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { expect, test, vi } from 'vitest'
import { AuthContext, type AuthContextValue } from '../../features/auth/auth-context'
import { AppShell } from './AppShell'

function makeAuthValue(overrides: Partial<AuthContextValue> = {}): AuthContextValue {
  return {
    session: null,
    isAuthenticated: false,
    login: vi.fn(),
    logout: vi.fn(),
    ...overrides,
  }
}

function renderShell(authValue: AuthContextValue) {
  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter>
        <AppShell>
          <p>Conteudo da pagina</p>
        </AppShell>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

test('tem os landmarks semanticos: cabecalho, navegacao, conteudo principal e rodape', () => {
  renderShell(makeAuthValue())

  expect(screen.getByRole('banner')).toBeInTheDocument()
  expect(screen.getByRole('navigation')).toBeInTheDocument()
  expect(screen.getByRole('main')).toBeInTheDocument()
  expect(screen.getByRole('contentinfo')).toBeInTheDocument()
})

test('renderiza o conteudo da pagina dentro da area principal', () => {
  renderShell(makeAuthValue())

  expect(screen.getByRole('main')).toHaveTextContent('Conteudo da pagina')
})

test('visitante anonimo ve "Entrar" e nao ve administracao/sair', () => {
  renderShell(makeAuthValue({ isAuthenticated: false }))

  expect(screen.getByRole('link', { name: 'Entrar' })).toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'Administração' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Sair' })).not.toBeInTheDocument()
})

test('usuario autenticado ve administracao e sair, e nao ve "Entrar"', () => {
  renderShell(makeAuthValue({ isAuthenticated: true }))

  expect(screen.getByRole('link', { name: 'Administração' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Sair' })).toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'Entrar' })).not.toBeInTheDocument()
})

test('clicar em "Sair" chama logout', () => {
  const logout = vi.fn()
  renderShell(makeAuthValue({ isAuthenticated: true, logout }))

  fireEvent.click(screen.getByRole('button', { name: 'Sair' }))

  expect(logout).toHaveBeenCalledTimes(1)
})
