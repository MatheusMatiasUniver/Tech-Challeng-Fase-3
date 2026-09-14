import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import styled, { keyframes } from 'styled-components'
import type { Post } from '../../types/api'
import { keepFocusInside } from '../../utils/keepFocusInside'

export interface DeletePostDialogProps {
  post: Post
  onConfirm: () => void
  onCancel: () => void
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
  padding: 28px;
  max-width: 440px;
  width: 100%;
  box-sizing: border-box;
  box-shadow: 0 30px 60px -30px rgba(0, 0, 0, 0.6);
  animation: ${riseIn} 0.25s ease both;
`

const Title = styled.h2`
  margin: 0 0 10px;
  font-size: 28px;
  line-height: normal;
`

const Message = styled.p`
  margin: 0 0 22px;
  font-size: 16px;
  line-height: 1.55;
  color: var(--text);
`

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
`

const buttonBase = `
  border-radius: 10px;
  padding: 11px 18px;
  font: inherit;
  font-size: 15px;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const CancelButton = styled.button`
  ${buttonBase}
  border: 1px solid var(--border-strong);
  background: none;
  color: var(--text);
  font-weight: 500;

  &:hover {
    border-color: var(--ink);
    color: var(--ink);
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
`

const ConfirmButton = styled.button`
  ${buttonBase}
  padding: 11px 20px;
  border: 0;
  background: var(--accent);
  color: #fff;
  font-weight: 600;

  &:hover:not(:disabled) {
    background: var(--error);
  }

  &:focus-visible {
    outline: 2px solid var(--ink);
    outline-offset: 2px;
  }
`

export function DeletePostDialog({ post, onConfirm, onCancel }: DeletePostDialogProps) {
  const [confirmed, setConfirmed] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const cancelButtonRef = useRef<HTMLButtonElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)

  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement | null
    cancelButtonRef.current?.focus()

    return () => {
      previouslyFocused.current?.focus()
    }
  }, [])

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      onCancel()
      return
    }

    keepFocusInside(event, panelRef.current)
  }

  function handleConfirm() {
    if (confirmed) {
      return
    }
    setConfirmed(true)
    onConfirm()
  }

  return (
    <Overlay onKeyDown={handleKeyDown}>
      <Panel ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="delete-dialog-title">
        <Title id="delete-dialog-title">Excluir post?</Title>
        <Message>&quot;{post.title}&quot; será removido permanentemente.</Message>
        <Actions>
          <CancelButton type="button" ref={cancelButtonRef} onClick={onCancel}>
            Cancelar
          </CancelButton>
          <ConfirmButton type="button" onClick={handleConfirm} disabled={confirmed}>
            Excluir
          </ConfirmButton>
        </Actions>
      </Panel>
    </Overlay>
  )
}
