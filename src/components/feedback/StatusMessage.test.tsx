import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import { StatusMessage } from './StatusMessage'

test('tom "info" usa role="status" e aria-live="polite"', () => {
  render(<StatusMessage tone="info">Carregando posts</StatusMessage>)

  const message = screen.getByText('Carregando posts')
  expect(message).toHaveAttribute('role', 'status')
  expect(message).toHaveAttribute('aria-live', 'polite')
})

test('tom "error" usa role="alert" e aria-live="assertive"', () => {
  render(<StatusMessage tone="error">Falha ao carregar</StatusMessage>)

  const message = screen.getByText('Falha ao carregar')
  expect(message).toHaveAttribute('role', 'alert')
  expect(message).toHaveAttribute('aria-live', 'assertive')
})

test('tom padrao (sem prop) e "info"', () => {
  render(<StatusMessage>Tudo certo</StatusMessage>)

  expect(screen.getByText('Tudo certo')).toHaveAttribute('role', 'status')
})
