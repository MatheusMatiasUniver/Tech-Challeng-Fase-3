import styled from 'styled-components'

const Main = styled.main`
  margin: 0 auto;
  max-width: 40rem;
  padding: 2rem 1rem;
`

const Title = styled.h1`
  color: var(--text-h);
  font-size: 1.75rem;
`

export default function App() {
  return (
    <Main>
      <Title>Blog FIAP</Title>
    </Main>
  )
}
