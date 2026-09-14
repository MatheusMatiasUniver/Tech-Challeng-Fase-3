import { useEffect, useRef, type KeyboardEvent } from 'react'
import styled, { keyframes } from 'styled-components'
import type { Post } from '../../types/api'
import { keepFocusInside } from '../../utils/keepFocusInside'

export interface PostCreatedDialogProps {
  post: Post
  onViewPost: () => void
  onBackToAdmin: () => void
  onCreateAnother: () => void
}

const riseIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: none;
  }
`

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 60;
  background: rgba(22, 24, 29, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`

const Panel = styled.div`
  background: var(--surface);
  border-radius: 16px;
  padding: 30px;
  max-width: 460px;
  width: 100%;
  box-sizing: border-box;
  box-shadow: 0 30px 60px -30px rgba(0, 0, 0, 0.6);
  animation: ${riseIn} 0.25s ease both;
`

const Eyebrow = styled.p`
  margin: 0 0 6px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--error);
`

const Title = styled.h2`
  margin: 0 0 10px;
  font-size: 30px;
  line-height: 1.1;
`

const Message = styled.p`
  margin: 0 0 24px;
  font-size: 16px;
  line-height: 1.6;
  color: var(--text);
  text-wrap: pretty;
`

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`

const buttonBase = `
  border-radius: 10px;
  font: inherit;
  font-size: 15px;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
`

const PrimaryButton = styled.button`
  ${buttonBase}
  padding: 12px 22px;
  border: 0;
  font-weight: 600;
  background: var(--ink);
  color: var(--on-ink);

  &:hover {
    background: var(--accent);
  }
`

const SecondaryButton = styled.button`
  ${buttonBase}
  padding: 12px 20px;
  border: 1px solid var(--border-strong);
  font-weight: 500;
  background: none;
  color: var(--text);

  &:hover {
    border-color: var(--ink);
    color: var(--ink);
  }
`

const TextButton = styled.button`
  ${buttonBase}
  padding: 12px 6px;
  border: 0;
  font-weight: 500;
  background: none;
  color: var(--muted);
  text-decoration: underline;
  text-underline-offset: 3px;

  &:hover {
    color: var(--accent);
  }
`

export function PostCreatedDialog({
  post,
  onViewPost,
  onBackToAdmin,
  onCreateAnother,
}: PostCreatedDialogProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const viewButtonRef = useRef<HTMLButtonElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)

  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement | null
    viewButtonRef.current?.focus()

    return () => {
      previouslyFocused.current?.focus()
    }
  }, [])

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      onCreateAnother()
      return
    }

    keepFocusInside(event, panelRef.current)
  }

  return (
    <Overlay onKeyDown={handleKeyDown}>
      <Panel ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="post-created-title">
        <Eyebrow>Publicado</Eyebrow>
        <Title id="post-created-title">Post criado com sucesso!</Title>
        <Message>&ldquo;{post.title}&rdquo; já está disponível para os leitores.</Message>
        <Actions>
          <PrimaryButton ref={viewButtonRef} type="button" onClick={onViewPost}>
            Ver post
          </PrimaryButton>
          <SecondaryButton type="button" onClick={onBackToAdmin}>
            Voltar à administração
          </SecondaryButton>
          <TextButton type="button" onClick={onCreateAnother}>
            Criar outro
          </TextButton>
        </Actions>
      </Panel>
    </Overlay>
  )
}
