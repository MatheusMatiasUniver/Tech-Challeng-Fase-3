import { Link } from 'react-router-dom'
import styled from 'styled-components'

const Wrapper = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem 1rem;
  text-align: center;
`

const Code = styled.p`
  margin: 0;
  font-size: 3rem;
  font-weight: 700;
  color: var(--text-h);
`

const HomeLink = styled(Link)`
  color: var(--accent);
  font-weight: 600;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

export function NotFoundPage() {
  return (
    <Wrapper>
      <Code aria-hidden="true">404</Code>
      <h1>Página não encontrada</h1>
      <p>O endereço que você tentou acessar não existe ou foi movido.</p>
      <HomeLink to="/">Voltar para a página inicial</HomeLink>
    </Wrapper>
  )
}
