import { fireEvent, render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import { PostForm } from './PostForm'

function fillForm(title: string, content: string) {
  fireEvent.change(screen.getByLabelText('Titulo'), { target: { value: title } })
  fireEvent.change(screen.getByLabelText('Conteudo'), { target: { value: content } })
}

test('cria um post: envia titulo e conteudo aparados', () => {
  const onSubmit = vi.fn()
  render(<PostForm status="idle" onSubmit={onSubmit} />)

  fillForm('  Meu titulo  ', '  Meu conteudo  ')
  fireEvent.click(screen.getByRole('button', { name: /salvar/i }))

  expect(onSubmit).toHaveBeenCalledWith({ title: 'Meu titulo', content: 'Meu conteudo' })
})

test('prefill: initialValues preenche os campos para edicao', () => {
  render(
    <PostForm
      status="idle"
      initialValues={{ title: 'Titulo existente', content: 'Conteudo existente' }}
      onSubmit={vi.fn()}
    />,
  )

  expect(screen.getByLabelText('Titulo')).toHaveValue('Titulo existente')
  expect(screen.getByLabelText('Conteudo')).toHaveValue('Conteudo existente')
})

test('titulo vazio mostra erro e nao submete', () => {
  const onSubmit = vi.fn()
  render(<PostForm status="idle" onSubmit={onSubmit} />)

  fillForm('', 'Algum conteudo')
  fireEvent.click(screen.getByRole('button', { name: /salvar/i }))

  expect(screen.getByRole('alert')).toHaveTextContent('Informe um titulo.')
  expect(onSubmit).not.toHaveBeenCalled()
})

test('titulo com mais de 255 caracteres mostra erro e nao submete', () => {
  const onSubmit = vi.fn()
  render(<PostForm status="idle" onSubmit={onSubmit} />)

  fillForm('a'.repeat(256), 'Algum conteudo')
  fireEvent.click(screen.getByRole('button', { name: /salvar/i }))

  expect(screen.getByRole('alert')).toHaveTextContent(/maximo 255/i)
  expect(onSubmit).not.toHaveBeenCalled()
})

test('conteudo vazio (so espacos) mostra erro e nao submete', () => {
  const onSubmit = vi.fn()
  render(<PostForm status="idle" onSubmit={onSubmit} />)

  fillForm('Titulo valido', '   ')
  fireEvent.click(screen.getByRole('button', { name: /salvar/i }))

  expect(screen.getByRole('alert')).toHaveTextContent('Informe o conteudo do post.')
  expect(onSubmit).not.toHaveBeenCalled()
})

test('status "loading" desabilita os campos e o botao', () => {
  render(<PostForm status="loading" onSubmit={vi.fn()} />)

  expect(screen.getByLabelText('Titulo')).toBeDisabled()
  expect(screen.getByLabelText('Conteudo')).toBeDisabled()
  expect(screen.getByRole('button', { name: /salvando/i })).toBeDisabled()
})

test('status "error" mostra a mensagem e preserva os dados digitados', () => {
  render(<PostForm status="error" errorMessage="Falha ao salvar o post." onSubmit={vi.fn()} />)

  fillForm('Titulo digitado', 'Conteudo digitado')

  expect(screen.getByRole('alert')).toHaveTextContent('Falha ao salvar o post.')
  expect(screen.getByLabelText('Titulo')).toHaveValue('Titulo digitado')
  expect(screen.getByLabelText('Conteudo')).toHaveValue('Conteudo digitado')
})

test('o payload enviado nunca tem campo de autor', () => {
  const onSubmit = vi.fn()
  render(<PostForm status="idle" onSubmit={onSubmit} />)

  fillForm('Titulo', 'Conteudo')
  fireEvent.click(screen.getByRole('button', { name: /salvar/i }))

  expect(onSubmit).toHaveBeenCalledWith({ title: 'Titulo', content: 'Conteudo' })
  expect(Object.keys(onSubmit.mock.calls[0][0])).toEqual(['title', 'content'])
})
