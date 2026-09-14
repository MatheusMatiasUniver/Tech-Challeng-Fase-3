import { startTransition, type ReactNode } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useAuth } from '../../features/auth/useAuth'

export interface AppShellProps {
  children: ReactNode
}

const Layout = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`

const SkipLink = styled.a`
  position: absolute;
  left: -9999px;
  top: 0;
  z-index: 50;
  padding: 10px 16px;
  border-radius: 0 0 8px 0;
  background: var(--ink);
  color: #fff;

  &:focus {
    left: 0;
  }
`

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 30;
  background: rgba(246, 243, 236, 0.88);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border);
`

const Container = styled.div`
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 20px;
  box-sizing: border-box;
`

const HeaderBar = styled(Container)`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px 20px;
  padding-block: 14px;
`

const focusRing = `
  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
`

const Brand = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px;
  margin-left: -4px;
  border-radius: 6px;
  font-family: var(--heading);
  font-size: 26px;
  line-height: 1;
  letter-spacing: -0.01em;
  color: var(--text-h);
  text-decoration: none;
  ${focusRing}
`

const Swatch = styled.span`
  display: inline-block;
  width: 26px;
  height: 26px;
  border-radius: 7px;
  background: var(--accent);
`

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 8px;
`

const NavItem = styled(NavLink)`
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 500;
  color: var(--text-h);
  text-decoration: none;

  &:hover {
    background: var(--hover-bg);
  }
  ${focusRing}
`

const PrimaryPillLink = styled(Link)`
  padding: 9px 16px;
  border-radius: 999px;
  background: var(--ink);
  color: var(--on-ink);
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;

  &:hover {
    background: var(--accent);
  }
  ${focusRing}
`

const SecondaryPillButton = styled.button`
  padding: 8px 14px;
  border: 1px solid var(--border-strong);
  border-radius: 999px;
  background: none;
  color: var(--text);
  font: inherit;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    border-color: var(--ink);
    color: var(--ink);
  }
  ${focusRing}
`

const Main = styled.main`
  flex: 1;
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  padding: 40px 20px 72px;
  box-sizing: border-box;

  &:focus {
    outline: none;
  }
`

const Footer = styled.footer`
  border-top: 1px solid var(--border);
  background: var(--footer-bg);
`

const FooterText = styled(Container)`
  padding-block: 26px;
  font-size: 14px;
  color: var(--muted);
`

export function AppShell({ children }: AppShellProps) {
  const { isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  // O React Router muda a rota dentro de uma transition (prioridade baixa).
  // O logout precisa ir na mesma transition: se fosse urgente, a tela seria
  // desenhada sem sessão ainda em /admin, e o ProtectedRoute mandaria para o login.
  function handleLogout() {
    navigate('/')
    startTransition(() => logout())
  }

  return (
    <Layout>
      <SkipLink href="#conteudo">Pular para o conteúdo</SkipLink>
      <Header>
        <HeaderBar>
          <Brand to="/" aria-label="Sala Aberta — ir para o início">
            <Swatch aria-hidden="true" />
            Sala Aberta
          </Brand>
          <Nav aria-label="Navegação principal">
            <NavItem to="/" end>
              Início
            </NavItem>
            {isAuthenticated ? (
              <>
                <NavItem to="/admin" end>
                  Administração
                </NavItem>
                <PrimaryPillLink to="/admin/posts/new">Novo post</PrimaryPillLink>
                <SecondaryPillButton type="button" onClick={handleLogout}>
                  Sair
                </SecondaryPillButton>
              </>
            ) : (
              <PrimaryPillLink to="/login">Entrar</PrimaryPillLink>
            )}
          </Nav>
        </HeaderBar>
      </Header>
      <Main id="conteudo" tabIndex={-1}>
        {children}
      </Main>
      <Footer>
        <FooterText as="p">Sala Aberta · conteúdo docente aberto a alunos e leitores</FooterText>
      </Footer>
    </Layout>
  )
}
