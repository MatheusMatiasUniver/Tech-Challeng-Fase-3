import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { useAuth } from '../../features/auth/useAuth'

export interface AppShellProps {
  children: ReactNode
}

const Header = styled.header`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1rem;
  border-bottom: 1px solid var(--border);
`

const Brand = styled(Link)`
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--text-h);
  text-decoration: none;
`

const Nav = styled.nav`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
`

const NavLink = styled(Link)`
  color: var(--text);
  text-decoration: none;
  font-weight: 600;

  &:hover {
    color: var(--accent);
  }
`

const LogoutButton = styled.button`
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 0.4rem 0.9rem;
  font: inherit;
  cursor: pointer;
  background: transparent;
  color: var(--text-h);

  &:hover {
    border-color: var(--accent);
    color: var(--accent);
  }
`

const Main = styled.main`
  flex: 1;
  width: 100%;
  max-width: 60rem;
  margin: 0 auto;
  padding: 1.5rem 1rem;
  box-sizing: border-box;
`

const Footer = styled.footer`
  padding: 1rem;
  text-align: center;
  font-size: 0.85rem;
  color: var(--text);
  border-top: 1px solid var(--border);
`

export function AppShell({ children }: AppShellProps) {
  const { isAuthenticated, logout } = useAuth()

  return (
    <>
      <Header>
        <Brand to="/">Blog FIAP</Brand>
        <Nav aria-label="Navegação principal">
          <NavLink to="/">Início</NavLink>
          {isAuthenticated ? (
            <>
              <NavLink to="/admin">Administração</NavLink>
              <LogoutButton type="button" onClick={logout}>
                Sair
              </LogoutButton>
            </>
          ) : (
            <NavLink to="/login">Entrar</NavLink>
          )}
        </Nav>
      </Header>
      <Main>{children}</Main>
      <Footer>Tech Challenge FIAP — Fase 3</Footer>
    </>
  )
}
