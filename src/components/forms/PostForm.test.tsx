import { fireEvent, render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import { PostForm } from './PostForm'

function fillForm(title: string, content: string) {
  fireEvent.change(screen.getByLabelText('Título'), { target: { value: title } })
  fireEvent.change(screen.getByLabelText('Conteúdo'), { target: { value: content } })
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

  expect(screen.getByLabelText('Título')).toHaveValue('Titulo existente')
  expect(screen.getByLabelText('Conteúdo')).toHaveValue('Conteudo existente')
})

test('titulo vazio mostra erro e nao submete', () => {
  const onSubmit = vi.fn()
  render(<PostForm status="idle" onSubmit={onSubmit} />)

  fillForm('', 'Algum conteudo')
  fireEvent.click(screen.getByRole('button', { name: /salvar/i }))

  expect(screen.getByRole('alert')).toHaveTextContent('Informe um título.')
  expect(onSubmit).not.toHaveBeenCalled()
})

test('titulo com mais de 255 caracteres mostra erro e nao submete', () => {
  const onSubmit = vi.fn()
  render(<PostForm status="idle" onSubmit={onSubmit} />)

  fillForm('a'.repeat(256), 'Algum conteudo')
  fireEvent.click(screen.getByRole('button', { name: /salvar/i }))

  expect(screen.getByRole('alert')).toHaveTextContent('O título deve ter no máximo 255 caracteres.')
  expect(onSubmit).not.toHaveBeenCalled()
})

test('conteudo vazio (so espacos) mostra erro e nao submete', () => {
  const onSubmit = vi.fn()
  render(<PostForm status="idle" onSubmit={onSubmit} />)

  fillForm('Titulo valido', '   ')
  fireEvent.click(screen.getByRole('button', { name: /salvar/i }))

  expect(screen.getByRole('alert')).toHaveTextContent('Informe o conteúdo do post.')
  expect(onSubmit).not.toHaveBeenCalled()
})

test('status "loading" desabilita os campos e o botao', () => {
  render(<PostForm status="loading" onSubmit={vi.fn()} />)

  expect(screen.getByLabelText('Título')).toBeDisabled()
  expect(screen.getByLabelText('Conteúdo')).toBeDisabled()
  expect(screen.getByRole('button', { name: /salvando/i })).toBeDisabled()
})

test('status "error" mostra a mensagem e preserva os dados digitados', () => {
  render(<PostForm status="error" errorMessage="Falha ao salvar o post." onSubmit={vi.fn()} />)

  fillForm('Titulo digitado', 'Conteudo digitado')

  expect(screen.getByRole('alert')).toHaveTextContent('Falha ao salvar o post.')
  expect(screen.getByLabelText('Título')).toHaveValue('Titulo digitado')
  expect(screen.getByLabelText('Conteúdo')).toHaveValue('Conteudo digitado')
})

test('mostra o contador de caracteres do conteudo, atualizado ao digitar', () => {
  render(<PostForm status="idle" onSubmit={vi.fn()} />)

  expect(screen.getByText('0 caracteres')).toBeInTheDocument()

  fireEvent.change(screen.getByLabelText('Conteúdo'), { target: { value: 'abcde' } })

  expect(screen.getByText('5 caracteres')).toBeInTheDocument()
})

test('sem onCancel, o botao "Cancelar" nao aparece', () => {
  render(<PostForm status="idle" onSubmit={vi.fn()} />)

  expect(screen.queryByRole('button', { name: /cancelar/i })).not.toBeInTheDocument()
})

test('com onCancel, clicar em "Cancelar" chama a funcao', () => {
  const onCancel = vi.fn()
  render(<PostForm status="idle" onSubmit={vi.fn()} onCancel={onCancel} />)

  fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

  expect(onCancel).toHaveBeenCalledTimes(1)
})

test('status "loading" tambem desabilita o botao "Cancelar"', () => {
  render(<PostForm status="loading" onSubmit={vi.fn()} onCancel={vi.fn()} />)

  expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled()
})

test('o payload enviado nunca tem campo de autor', () => {
  const onSubmit = vi.fn()
  render(<PostForm status="idle" onSubmit={onSubmit} />)

  fillForm('Titulo', 'Conteudo')
  fireEvent.click(screen.getByRole('button', { name: /salvar/i }))

  expect(onSubmit).toHaveBeenCalledWith({ title: 'Titulo', content: 'Conteudo' })
  expect(Object.keys(onSubmit.mock.calls[0][0])).toEqual(['title', 'content'])
})

test('os campos tem placeholders explicando o que escrever', () => {
  render(<PostForm status="idle" onSubmit={vi.fn()} />)

  expect(screen.getByLabelText('Título')).toHaveAttribute(
    'placeholder',
    'Ex.: Como estruturar um projeto React',
  )
  expect(screen.getByLabelText('Conteúdo')).toHaveAttribute('placeholder', 'Escreva o post…')
})
