import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import { FormField } from './FormField'

test('o label aponta para o controle (associacao via htmlFor/id)', () => {
  render(
    <FormField id="titulo" label="Titulo">
      <input type="text" />
    </FormField>,
  )

  expect(screen.getByLabelText('Titulo')).toBeInTheDocument()
})

test('sem erro, o controle nao tem aria-invalid nem aria-describedby', () => {
  render(
    <FormField id="titulo" label="Titulo">
      <input type="text" />
    </FormField>,
  )

  const input = screen.getByLabelText('Titulo')
  expect(input).not.toHaveAttribute('aria-invalid')
  expect(input).not.toHaveAttribute('aria-describedby')
})

test('com erro, o controle ganha aria-invalid e aria-describedby apontando pro erro', () => {
  render(
    <FormField id="titulo" label="Titulo" error="Titulo obrigatorio">
      <input type="text" />
    </FormField>,
  )

  const input = screen.getByLabelText('Titulo')
  const errorMessage = screen.getByRole('alert')

  expect(input).toHaveAttribute('aria-invalid', 'true')
  expect(input).toHaveAttribute('aria-describedby', errorMessage.id)
  expect(errorMessage).toHaveTextContent('Titulo obrigatorio')
})

test('o erro fica visivel como texto, nao so como cor (nao depende so de cor)', () => {
  render(
    <FormField id="titulo" label="Titulo" error="Titulo obrigatorio">
      <input type="text" />
    </FormField>,
  )

  expect(screen.getByRole('alert')).toHaveTextContent('Titulo obrigatorio')
})

test('com hint (sem erro), o controle referencia a dica em aria-describedby', () => {
  render(
    <FormField id="titulo" label="Titulo" hint="Minimo de 3 caracteres">
      <input type="text" />
    </FormField>,
  )

  const input = screen.getByLabelText('Titulo')
  expect(screen.getByText('Minimo de 3 caracteres')).toBeInTheDocument()
  expect(input).toHaveAttribute('aria-describedby', expect.stringContaining('titulo-hint'))
})
