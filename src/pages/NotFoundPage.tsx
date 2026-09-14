import { Link } from 'react-router-dom'
import styled from 'styled-components'

const Wrapper = styled.div`
  max-width: 560px;
  margin: 40px auto;
  text-align: center;
`

const Code = styled.p`
  margin: 0;
  font-family: var(--heading);
  font-size: clamp(96px, 22vw, 180px);
  line-height: 0.9;
  color: var(--border);
`

const Title = styled.h1`
  margin: 12px 0 10px;
  font-size: 36px;
  line-height: normal;
`

const Text = styled.p`
  margin: 0 0 24px;
  font-size: 16px;
  color: var(--text);
`

const HomeButton = styled(Link)`
  display: inline-block;
  padding: 13px 24px;
  border-radius: 10px;
  background: var(--ink);
  color: var(--on-ink);
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;

  &:hover {
    background: var(--accent);
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
`

export function NotFoundPage() {
  return (
    <Wrapper>
      <Code aria-hidden="true">404</Code>
      <Title>Página não encontrada</Title>
      <Text>O endereço não existe ou foi movido.</Text>
      <HomeButton to="/">Voltar para a página inicial</HomeButton>
    </Wrapper>
  )
}
