import { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import { DeletePostDialog } from './DeletePostDialog'
import type { Post } from '../../types/api'

const post: Post = {
  id: 'post-1',
  title: 'Meu Post Importante',
  content: 'Conteudo qualquer.',
  authorId: 'user-1',
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
}

function Harness({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void
  onCancel: () => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button onClick={() => setOpen(true)}>Excluir Post</button>
      {open ? (
        <DeletePostDialog
          post={post}
          onConfirm={onConfirm}
          onCancel={() => {
            onCancel()
            setOpen(false)
          }}
        />
      ) : null}
    </>
  )
}

test('o titulo do post aparece na confirmacao', () => {
  render(<DeletePostDialog post={post} onConfirm={vi.fn()} onCancel={vi.fn()} />)

  expect(screen.getByRole('dialog')).toHaveTextContent('Meu Post Importante')
})

test('Escape aciona cancelar, nunca confirmar', () => {
  const onConfirm = vi.fn()
  const onCancel = vi.fn()
  render(<DeletePostDialog post={post} onConfirm={onConfirm} onCancel={onCancel} />)

  fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })

  expect(onCancel).toHaveBeenCalledTimes(1)
  expect(onConfirm).not.toHaveBeenCalled()
})

test('clicar em Cancelar aciona onCancel e nao onConfirm', () => {
  const onConfirm = vi.fn()
  const onCancel = vi.fn()
  render(<DeletePostDialog post={post} onConfirm={onConfirm} onCancel={onCancel} />)

  fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

  expect(onCancel).toHaveBeenCalledTimes(1)
  expect(onConfirm).not.toHaveBeenCalled()
})

test('confirmar dispara onConfirm uma unica vez, mesmo clicando duas vezes', () => {
  const onConfirm = vi.fn()
  render(<DeletePostDialog post={post} onConfirm={onConfirm} onCancel={vi.fn()} />)

  const confirmButton = screen.getByRole('button', { name: 'Excluir' })
  fireEvent.click(confirmButton)
  fireEvent.click(confirmButton)

  expect(onConfirm).toHaveBeenCalledTimes(1)
  expect(confirmButton).toBeDisabled()
})

test('ao abrir, o foco vai para o botao Cancelar (acao menos destrutiva)', () => {
  render(<DeletePostDialog post={post} onConfirm={vi.fn()} onCancel={vi.fn()} />)

  expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveFocus()
})

test('ao fechar (cancelar), o foco volta para quem abriu o dialogo', () => {
  render(<Harness onConfirm={vi.fn()} onCancel={vi.fn()} />)

  const trigger = screen.getByRole('button', { name: 'Excluir Post' })
  trigger.focus()
  fireEvent.click(trigger)

  expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveFocus()

  fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

  expect(trigger).toHaveFocus()
})
