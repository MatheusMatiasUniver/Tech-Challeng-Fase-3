import { fireEvent, render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import { AsyncState } from './AsyncState'

test('status "loading" mostra o texto padrao', () => {
  render(<AsyncState status="loading" />)

  expect(screen.getByRole('status')).toHaveTextContent('Carregando...')
})

test('status "loading" aceita um texto customizado', () => {
  render(<AsyncState status="loading" label="Carregando posts..." />)

  expect(screen.getByRole('status')).toHaveTextContent('Carregando posts...')
})

test('status "empty" mostra o texto informado', () => {
  render(<AsyncState status="empty" label="Nenhum post encontrado." />)

  expect(screen.getByRole('status')).toHaveTextContent('Nenhum post encontrado.')
})

test('status "error" mostra a mensagem com role="alert"', () => {
  render(<AsyncState status="error" message="Falha ao carregar posts." />)

  expect(screen.getByRole('alert')).toHaveTextContent('Falha ao carregar posts.')
})

test('status "error" sem onRetry nao mostra botao', () => {
  render(<AsyncState status="error" message="Falha ao carregar posts." />)

  expect(screen.queryByRole('button')).not.toBeInTheDocument()
})

test('status "error" com onRetry mostra botao e chama a funcao ao clicar', () => {
  const onRetry = vi.fn()
  render(<AsyncState status="error" message="Falha ao carregar posts." onRetry={onRetry} />)

  fireEvent.click(screen.getByRole('button', { name: /tentar novamente/i }))

  expect(onRetry).toHaveBeenCalledTimes(1)
})
