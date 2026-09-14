import { fireEvent, render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import { SearchForm } from './SearchForm'

test('digitar e submeter envia o termo aparado', () => {
  const onSearch = vi.fn()
  render(<SearchForm onSearch={onSearch} onClear={vi.fn()} />)

  fireEvent.change(screen.getByLabelText('Termo de busca'), {
    target: { value: '  react  ' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Buscar' }))

  expect(onSearch).toHaveBeenCalledWith('react')
})

test('submeter com o campo vazio nao dispara a busca', () => {
  const onSearch = vi.fn()
  render(<SearchForm onSearch={onSearch} onClear={vi.fn()} />)

  fireEvent.click(screen.getByRole('button', { name: 'Buscar' }))

  expect(onSearch).not.toHaveBeenCalled()
})

test('submeter so com espacos nao dispara a busca', () => {
  const onSearch = vi.fn()
  render(<SearchForm onSearch={onSearch} onClear={vi.fn()} />)

  fireEvent.change(screen.getByLabelText('Termo de busca'), {
    target: { value: '   ' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Buscar' }))

  expect(onSearch).not.toHaveBeenCalled()
})

test('o Enter no campo submete o formulario', () => {
  const onSearch = vi.fn()
  render(<SearchForm onSearch={onSearch} onClear={vi.fn()} />)

  fireEvent.change(screen.getByLabelText('Termo de busca'), {
    target: { value: 'testes' },
  })
  fireEvent.submit(screen.getByRole('search'))

  expect(onSearch).toHaveBeenCalledWith('testes')
})

test('limpar esvazia o campo e chama onClear', () => {
  const onClear = vi.fn()
  render(<SearchForm value="react" onSearch={vi.fn()} onClear={onClear} />)

  fireEvent.click(screen.getByRole('button', { name: 'Limpar' }))

  expect(screen.getByLabelText('Termo de busca')).toHaveValue('')
  expect(onClear).toHaveBeenCalledTimes(1)
})

test('o campo tem um placeholder explicando o que buscar', () => {
  render(<SearchForm onSearch={vi.fn()} onClear={vi.fn()} />)

  expect(screen.getByLabelText('Termo de busca')).toHaveAttribute(
    'placeholder',
    'Título, autor ou trecho',
  )
})

test('o campo tem label visivel e os botoes tem nome acessivel', () => {
  render(<SearchForm onSearch={vi.fn()} onClear={vi.fn()} />)

  expect(screen.getByText('Termo de busca')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Buscar' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Limpar' })).toBeInTheDocument()
})
