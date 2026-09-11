import type { ReactNode } from 'react'
import styled from 'styled-components'

export type StatusTone = 'info' | 'error'

export interface StatusMessageProps {
  tone?: StatusTone
  children: ReactNode
}

const Text = styled.p<{ $tone: StatusTone }>`
  margin: 0;
  color: ${({ $tone }) => ($tone === 'error' ? 'var(--error)' : 'var(--text)')};
`

export function StatusMessage({ tone = 'info', children }: StatusMessageProps) {
  const role = tone === 'error' ? 'alert' : 'status'
  const ariaLive = tone === 'error' ? 'assertive' : 'polite'

  return (
    <Text $tone={tone} role={role} aria-live={ariaLive}>
      {children}
    </Text>
  )
}
