import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

export interface PostEditorLayoutProps {
  title: string
  authorName: string
  children: ReactNode
}

const Wrapper = styled.div`
  max-width: 720px;
  margin: 0 auto;
`

const BackLink = styled(Link)`
  display: inline-block;
  margin-bottom: 20px;
  padding: 6px 0;
  font-size: 15px;
  font-weight: 500;
  color: var(--text);
  text-decoration: none;

  &:hover {
    color: var(--accent);
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 3px;
  }
`

const Title = styled.h1`
  margin: 0 0 6px;
  font-size: clamp(32px, 5vw, 46px);
  line-height: 1.05;
`

const Byline = styled.p`
  margin: 0 0 24px;
  font-size: 14px;
  color: var(--muted);
`

export function PostEditorLayout({ title, authorName, children }: PostEditorLayoutProps) {
  return (
    <Wrapper>
      <BackLink to="/admin">← Voltar para a administração</BackLink>
      <Title>{title}</Title>
      <Byline>Publicando como: {authorName}</Byline>
      {children}
    </Wrapper>
  )
}
