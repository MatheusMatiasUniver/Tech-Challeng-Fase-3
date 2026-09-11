import { cloneElement, type ReactElement } from 'react'
import styled from 'styled-components'

type ControlProps = {
  id?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean
}

export interface FormFieldProps {
  id: string
  label: string
  hint?: string
  error?: string
  children: ReactElement<ControlProps>
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  text-align: left;
`

const Label = styled.label`
  font-weight: 600;
  color: var(--text-h);
`

const HintText = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: var(--text);
`

const ErrorText = styled.p`
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.85rem;
  color: var(--error);

  &::before {
    content: '⚠';
  }
`

export function FormField({ id, label, hint, error, children }: FormFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  const control = cloneElement(children, {
    id,
    'aria-describedby': describedBy,
    'aria-invalid': error ? true : undefined,
  })

  return (
    <Wrapper>
      <Label htmlFor={id}>{label}</Label>
      {control}
      {hint ? <HintText id={hintId}>{hint}</HintText> : null}
      {error ? (
        <ErrorText id={errorId} role="alert">
          {error}
        </ErrorText>
      ) : null}
    </Wrapper>
  )
}
