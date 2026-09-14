import styled, { keyframes } from 'styled-components'
import { StatusMessage } from './StatusMessage'

export type AsyncStateProps =
  | { status: 'loading'; label?: string }
  | { status: 'empty'; label: string }
  | { status: 'error'; message: string; onRetry?: () => void }

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`

const Loading = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 48px 0;
  font-size: 16px;
`

const Spinner = styled.span`
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid var(--border-strong);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`

const Empty = styled.div`
  padding: 48px 24px;
  border: 1px dashed var(--border-strong);
  border-radius: 14px;
  text-align: center;
  font-size: 17px;
`

const ErrorBox = styled.div`
  padding: 24px;
  border: 1px solid var(--accent-soft);
  border-radius: 14px;
  background: var(--error-bg);
  font-size: 16px;
`

const RetryButton = styled.button`
  margin-top: 14px;
  border: 0;
  border-radius: 10px;
  padding: 10px 18px;
  font: inherit;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  background: var(--accent);
  color: #fff;

  &:focus-visible {
    outline: 2px solid var(--ink);
    outline-offset: 2px;
  }
`

export function AsyncState(props: AsyncStateProps) {
  if (props.status === 'loading') {
    return (
      <Loading>
        <Spinner aria-hidden="true" />
        <StatusMessage tone="info">{props.label ?? 'Carregando...'}</StatusMessage>
      </Loading>
    )
  }

  if (props.status === 'empty') {
    return (
      <Empty>
        <StatusMessage tone="info">{props.label}</StatusMessage>
      </Empty>
    )
  }

  return (
    <ErrorBox>
      <StatusMessage tone="error">{props.message}</StatusMessage>
      {props.onRetry ? (
        <RetryButton type="button" onClick={props.onRetry}>
          Tentar novamente
        </RetryButton>
      ) : null}
    </ErrorBox>
  )
}
