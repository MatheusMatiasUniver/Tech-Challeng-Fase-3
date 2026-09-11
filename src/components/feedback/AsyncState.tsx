import styled from 'styled-components'
import { StatusMessage } from './StatusMessage'

export type AsyncStateProps =
  | { status: 'loading'; label?: string }
  | { status: 'empty'; label: string }
  | { status: 'error'; message: string; onRetry?: () => void }

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 2rem 1rem;
  text-align: center;
`

const RetryButton = styled.button`
  border: 1px solid var(--border);
  border-radius: 4px;
  background: transparent;
  color: var(--text-h);
  padding: 0.5rem 1rem;
  font: inherit;
  cursor: pointer;

  &:hover {
    border-color: var(--accent);
    color: var(--accent);
  }
`

export function AsyncState(props: AsyncStateProps) {
  if (props.status === 'loading') {
    return (
      <Wrapper>
        <StatusMessage tone="info">{props.label ?? 'Carregando...'}</StatusMessage>
      </Wrapper>
    )
  }

  if (props.status === 'empty') {
    return (
      <Wrapper>
        <StatusMessage tone="info">{props.label}</StatusMessage>
      </Wrapper>
    )
  }

  return (
    <Wrapper>
      <StatusMessage tone="error">{props.message}</StatusMessage>
      {props.onRetry ? (
        <RetryButton type="button" onClick={props.onRetry}>
          Tentar novamente
        </RetryButton>
      ) : null}
    </Wrapper>
  )
}
