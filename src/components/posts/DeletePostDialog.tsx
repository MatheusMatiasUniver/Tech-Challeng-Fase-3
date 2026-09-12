import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import styled from 'styled-components'
import type { Post } from '../../types/api'

export interface DeletePostDialogProps {
  post: Post
  onConfirm: () => void
  onCancel: () => void
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`

const Panel = styled.div`
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1.5rem;
  max-width: 28rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
`

const Button = styled.button`
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font: inherit;
  cursor: pointer;
  background: transparent;
  color: var(--text-h);

  &:hover:not(:disabled) {
    border-color: var(--accent);
    color: var(--accent);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const ConfirmButton = styled(Button)`
  border-color: var(--error);
  color: var(--error);

  &:hover:not(:disabled) {
    border-color: var(--error);
    color: var(--error);
  }
`

export function DeletePostDialog({ post, onConfirm, onCancel }: DeletePostDialogProps) {
  const [confirmed, setConfirmed] = useState(false)
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
    }
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
      <Panel role="dialog" aria-modal="true" aria-labelledby="delete-dialog-title">
        <h2 id="delete-dialog-title">Excluir "{post.title}"?</h2>
        <p>Essa ação não pode ser desfeita.</p>
        <Actions>
          <Button type="button" ref={cancelButtonRef} onClick={onCancel}>
            Cancelar
          </Button>
          <ConfirmButton type="button" onClick={handleConfirm} disabled={confirmed}>
            Excluir
          </ConfirmButton>
        </Actions>
      </Panel>
    </Overlay>
  )
}
