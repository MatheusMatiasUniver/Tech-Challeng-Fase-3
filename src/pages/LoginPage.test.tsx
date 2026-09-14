import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { expect, test, vi } from 'vitest'
import { AuthContext, type AuthContextValue } from '../features/auth/auth-context'
import { LoginPage } from './LoginPage'

function makeAuthValue(overrides: Partial<AuthContextValue> = {}): AuthContextValue {
  return {
    session: null,
    isAuthenticated: false,
    login: vi.fn().mockResolvedValue(undefined),
    logout: vi.fn(),
    ...overrides,
  }
}

function renderLoginPage(authValue: AuthContextValue, initialEntry = '/login') {
  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<p>Pagina Admin</p>} />
          <Route path="/posts/:postId" element={<p>Pagina do Post</p>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

function submit(email: string, password: string) {
  fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: email } })
  fireEvent.change(screen.getByLabelText('Senha'), { target: { value: password } })
  fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))
}

test('login valido sem destino preservado redireciona para /admin', async () => {
  renderLoginPage(makeAuthValue())

  submit('professor@escola.com', 'segredo123')

  expect(await screen.findByText('Pagina Admin')).toBeInTheDocument()
})

test('login valido com destino preservado redireciona para ele', async () => {
  renderLoginPage(makeAuthValue(), `/login?redirect=${encodeURIComponent('/posts/123')}`)

  submit('professor@escola.com', 'segredo123')

  expect(await screen.findByText('Pagina do Post')).toBeInTheDocument()
})

function apiError(status: number, message: string) {
  const error = new Error(message) as Error & { status: number }
  error.status = status
  return error
}

test('login recusado (401) mostra mensagem amigavel e permanece no login', async () => {
  const login = vi.fn().mockRejectedValue(apiError(401, 'Credenciais inválidas'))
  renderLoginPage(makeAuthValue({ login }))

  submit('professor@escola.com', 'senha-errada')

  expect(await screen.findByRole('alert')).toHaveTextContent(
    'E-mail ou senha inválidos. Tente novamente.',
  )
  expect(screen.queryByText('Credenciais inválidas')).not.toBeInTheDocument()
  expect(screen.queryByText('Pagina Admin')).not.toBeInTheDocument()
})

test('erro que nao e 401 (ex.: falha de rede) mostra a propria mensagem', async () => {
  const login = vi.fn().mockRejectedValue(new Error('Falha de rede. Tente novamente.'))
  renderLoginPage(makeAuthValue({ login }))

  submit('professor@escola.com', 'segredo123')

  expect(await screen.findByRole('alert')).toHaveTextContent('Falha de rede. Tente novamente.')
})

test('sem destino preservado, o subtitulo diz que a area e restrita', () => {
  renderLoginPage(makeAuthValue())

  expect(screen.getByText('Área restrita aos docentes da Sala Aberta.')).toBeInTheDocument()
})

test('vindo de rota protegida, o subtitulo pede login para a administracao', () => {
  renderLoginPage(makeAuthValue(), `/login?redirect=${encodeURIComponent('/admin')}`)

  expect(
    screen.getByText('Faça login para acessar a área de administração.'),
  ).toBeInTheDocument()
})

test('usuario ja autenticado nao permanece na tela de login', () => {
  renderLoginPage(makeAuthValue({ isAuthenticated: true }))

  expect(screen.getByText('Pagina Admin')).toBeInTheDocument()
  expect(screen.queryByLabelText('E-mail')).not.toBeInTheDocument()
})

test('destino externo/malformado e rejeitado, cai no fallback /admin', async () => {
  renderLoginPage(
    makeAuthValue(),
    `/login?redirect=${encodeURIComponent('https://site-malicioso.com')}`,
  )

  submit('professor@escola.com', 'segredo123')

  expect(await screen.findByText('Pagina Admin')).toBeInTheDocument()
})

test('destino protocol-relative (//) tambem e rejeitado', async () => {
  renderLoginPage(
    makeAuthValue(),
    `/login?redirect=${encodeURIComponent('//site-malicioso.com')}`,
  )

  submit('professor@escola.com', 'segredo123')

  expect(await screen.findByText('Pagina Admin')).toBeInTheDocument()
})
