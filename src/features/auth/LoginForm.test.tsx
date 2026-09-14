import { fireEvent, render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import { LoginForm } from './LoginForm'

function fillForm(email: string, password: string) {
  fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: email } })
  fireEvent.change(screen.getByLabelText('Senha'), { target: { value: password } })
}

test('campos vazios mostram erro e nao submetem', () => {
  const onSubmit = vi.fn()
  render(<LoginForm status="idle" onSubmit={onSubmit} />)

  fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))

  expect(screen.getByText('Informe o e-mail.')).toBeInTheDocument()
  expect(screen.getByText('Informe a senha.')).toBeInTheDocument()
  expect(onSubmit).not.toHaveBeenCalled()
})

test('credenciais validas chamam onSubmit com o e-mail aparado', () => {
  const onSubmit = vi.fn()
  render(<LoginForm status="idle" onSubmit={onSubmit} />)

  fillForm('  professor@escola.com  ', 'segredo123')
  fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))

  expect(onSubmit).toHaveBeenCalledWith({ email: 'professor@escola.com', password: 'segredo123' })
})

test('os campos tem autocomplete apropriado', () => {
  render(<LoginForm status="idle" onSubmit={vi.fn()} />)

  expect(screen.getByLabelText('E-mail')).toHaveAttribute('autocomplete', 'email')
  expect(screen.getByLabelText('Senha')).toHaveAttribute('autocomplete', 'current-password')
})

test('status "loading" desabilita campos e botao, e bloqueia novo envio', () => {
  render(<LoginForm status="loading" onSubmit={vi.fn()} />)

  expect(screen.getByLabelText('E-mail')).toBeDisabled()
  expect(screen.getByLabelText('Senha')).toBeDisabled()
  expect(screen.getByRole('button', { name: /entrando/i })).toBeDisabled()
})

test('erro da API mostra a mensagem e mantem o e-mail preenchido', () => {
  render(<LoginForm status="error" errorMessage="Credenciais invalidas." onSubmit={vi.fn()} />)

  fillForm('professor@escola.com', 'senha-errada')

  expect(screen.getByText('Credenciais invalidas.')).toBeInTheDocument()
  expect(screen.getByLabelText('E-mail')).toHaveValue('professor@escola.com')
})

test('a senha e limpa do campo logo apos o envio', () => {
  render(<LoginForm status="idle" onSubmit={vi.fn()} />)

  fillForm('professor@escola.com', 'segredo123')
  fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))

  expect(screen.getByLabelText('Senha')).toHaveValue('')
})
