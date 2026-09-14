import { useState, type FormEvent } from 'react'
import styled from 'styled-components'
import { StatusMessage } from '../../components/feedback/StatusMessage'
import { FormField } from '../../components/forms/FormField'

export type LoginFormStatus = 'idle' | 'loading' | 'success' | 'error'

export interface LoginFormValues {
  email: string
  password: string
}

export interface LoginFormProps {
  status: LoginFormStatus
  errorMessage?: string
  onSubmit: (values: LoginFormValues) => void
}

interface FieldErrors {
  email?: string
  password?: string
}

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 18px;
`

const Input = styled.input`
  font: inherit;
  font-size: 16px;
  padding: 12px 14px;
  background: var(--bg);
  color: var(--text-h);
  border: 1px solid var(--border-strong);
  border-radius: 10px;

  &:focus {
    outline: 2px solid var(--accent);
    outline-offset: 1px;
    border-color: var(--accent);
  }
`

const ErrorBox = styled.div`
  padding: 12px 14px;
  font-size: 15px;
  background: var(--error-bg);
  border: 1px solid var(--accent-soft);
  border-radius: 10px;
`

const SubmitButton = styled.button`
  border: 0;
  border-radius: 10px;
  padding: 13px 18px;
  font: inherit;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  background: var(--ink);
  color: var(--on-ink);

  &:hover:not(:disabled) {
    background: var(--accent);
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

export function LoginForm({ status, errorMessage, onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const isLoading = status === 'loading'

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedEmail = email.trim()
    const fieldErrors: FieldErrors = {}
    if (!trimmedEmail) {
      fieldErrors.email = 'Informe o e-mail.'
    }
    if (!password) {
      fieldErrors.password = 'Informe a senha.'
    }
    setErrors(fieldErrors)

    if (Object.keys(fieldErrors).length > 0) {
      return
    }

    setPassword('')
    onSubmit({ email: trimmedEmail, password })
  }

  return (
    <Form onSubmit={handleSubmit} noValidate>
      <FormField id="login-email" label="E-mail" error={errors.email}>
        <Input
          type="email"
          autoComplete="email"
          value={email}
          disabled={isLoading}
          onChange={(event) => {
            setEmail(event.target.value)
            setErrors((current) => ({ ...current, email: undefined }))
          }}
        />
      </FormField>
      <FormField id="login-password" label="Senha" error={errors.password}>
        <Input
          type="password"
          autoComplete="current-password"
          value={password}
          disabled={isLoading}
          onChange={(event) => {
            setPassword(event.target.value)
            setErrors((current) => ({ ...current, password: undefined }))
          }}
        />
      </FormField>
      {status === 'error' && errorMessage ? (
        <ErrorBox>
          <StatusMessage tone="error">{errorMessage}</StatusMessage>
        </ErrorBox>
      ) : null}
      <SubmitButton type="submit" disabled={isLoading}>
        {isLoading ? 'Entrando...' : 'Entrar'}
      </SubmitButton>
    </Form>
  )
}
