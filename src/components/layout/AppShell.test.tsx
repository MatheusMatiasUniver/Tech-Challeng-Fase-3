import { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { expect, test, vi } from 'vitest'
import { AuthContext, type AuthContextValue } from '../../features/auth/auth-context'
import { ProtectedRoute } from '../../features/auth/ProtectedRoute'
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

test('tem link "Pular para o conteudo" apontando para a area principal', () => {
  renderShell(makeAuthValue())

  expect(screen.getByRole('link', { name: 'Pular para o conteúdo' })).toHaveAttribute(
    'href',
    '#conteudo',
  )
  expect(screen.getByRole('main')).toHaveAttribute('id', 'conteudo')
})

test('marca "Inicio" como pagina atual quando a rota e "/"', () => {
  renderShell(makeAuthValue({ isAuthenticated: true }))

  expect(screen.getByRole('link', { name: 'Início' })).toHaveAttribute('aria-current', 'page')
  expect(screen.getByRole('link', { name: 'Administração' })).not.toHaveAttribute('aria-current')
})

test('visitante anonimo ve "Entrar" e nao ve administracao/sair', () => {
  renderShell(makeAuthValue({ isAuthenticated: false }))

  expect(screen.getByRole('link', { name: 'Entrar' })).toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'Administração' })).not.toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'Novo post' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Sair' })).not.toBeInTheDocument()
})

test('usuario autenticado ve administracao, novo post e sair, e nao ve "Entrar"', () => {
  renderShell(makeAuthValue({ isAuthenticated: true }))

  expect(screen.getByRole('link', { name: 'Administração' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Novo post' })).toHaveAttribute(
    'href',
    '/admin/posts/new',
  )
  expect(screen.getByRole('button', { name: 'Sair' })).toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'Entrar' })).not.toBeInTheDocument()
})

test('clicar em "Sair" chama logout', () => {
  const logout = vi.fn()
  renderShell(makeAuthValue({ isAuthenticated: true, logout }))

  fireEvent.click(screen.getByRole('button', { name: 'Sair' }))

  expect(logout).toHaveBeenCalledTimes(1)
})

test('clicar em "Sair" numa rota protegida leva para a pagina inicial, e nao para o login', async () => {
  function Harness() {
    const [isAuthenticated, setIsAuthenticated] = useState(true)
    const authValue = makeAuthValue({ isAuthenticated, logout: () => setIsAuthenticated(false) })

    return (
      <AuthContext.Provider value={authValue}>
        <MemoryRouter initialEntries={['/admin']}>
          <AppShell>
            <Routes>
              <Route element={<ProtectedRoute />}>
                <Route path="/admin" element={<p>Pagina Admin</p>} />
              </Route>
              <Route path="/login" element={<p>Pagina Login</p>} />
              <Route path="/" element={<p>Pagina Home</p>} />
            </Routes>
          </AppShell>
        </MemoryRouter>
      </AuthContext.Provider>
    )
  }

  render(<Harness />)
  fireEvent.click(screen.getByRole('button', { name: 'Sair' }))

  expect(await screen.findByText('Pagina Home')).toBeInTheDocument()
  expect(screen.queryByText('Pagina Login')).not.toBeInTheDocument()
})
