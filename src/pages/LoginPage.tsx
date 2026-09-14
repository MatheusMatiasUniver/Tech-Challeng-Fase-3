import { useState } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import styled from 'styled-components'
import { LoginForm, type LoginFormStatus, type LoginFormValues } from '../features/auth/LoginForm'
import { useAuth } from '../features/auth/useAuth'

const INVALID_CREDENTIALS_MESSAGE = 'E-mail ou senha inválidos. Tente novamente.'

const Wrapper = styled.div`
  max-width: 420px;
  margin: 24px auto 0;
`

const Title = styled.h1`
  margin: 0 0 8px;
  font-size: 44px;
  line-height: 1.05;
`

const Subtitle = styled.p`
  margin: 0 0 26px;
  font-size: 16px;
  color: var(--text);
`

const Card = styled.div`
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 26px;
`

function isSafeRedirect(path: unknown): path is string {
  return (
    typeof path === 'string' &&
    path.startsWith('/') &&
    !path.startsWith('//') &&
    !path.includes('://')
  )
}

export function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<LoginFormStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const redirect = searchParams.get('redirect')
  const hasSafeRedirect = isSafeRedirect(redirect)
  const redirectTo = hasSafeRedirect ? redirect : '/admin'

  if (isAuthenticated || status === 'success') {
    return <Navigate to={redirectTo} replace />
  }

  function handleSubmit(credentials: LoginFormValues) {
    setStatus('loading')
    login(credentials).then(
      () => setStatus('success'),
      (error: unknown) => {
        const httpStatus = (error as { status?: number | null } | null)?.status
        setErrorMessage(
          httpStatus === 401
            ? INVALID_CREDENTIALS_MESSAGE
            : error instanceof Error
              ? error.message
              : 'Erro inesperado.',
        )
        setStatus('error')
      },
    )
  }

  return (
    <Wrapper>
      <Title>Entrar</Title>
      <Subtitle>
        {hasSafeRedirect
          ? 'Faça login para acessar a área de administração.'
          : 'Área restrita aos docentes da Sala Aberta.'}
      </Subtitle>
      <Card>
        <LoginForm status={status} errorMessage={errorMessage} onSubmit={handleSubmit} />
      </Card>
    </Wrapper>
  )
}
