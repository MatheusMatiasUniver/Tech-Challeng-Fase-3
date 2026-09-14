import { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import { PostCreatedDialog } from './PostCreatedDialog'
import type { Post } from '../../types/api'

const post: Post = {
  id: 'post-1',
  title: 'Meu Post Novo',
  content: 'Conteudo qualquer.',
  authorId: 'user-1',
  createdAt: '2026-09-13T00:00:00.000Z',
  updatedAt: '2026-09-13T00:00:00.000Z',
}

function Harness({
  onViewPost,
  onBackToAdmin,
  onCreateAnother,
}: {
  onViewPost: () => void
  onBackToAdmin: () => void
  onCreateAnother: () => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button onClick={() => setOpen(true)}>Salvar</button>
      {open ? (
        <PostCreatedDialog
          post={post}
          onViewPost={onViewPost}
          onBackToAdmin={onBackToAdmin}
          onCreateAnother={() => {
            onCreateAnother()
            setOpen(false)
          }}
        />
      ) : null}
    </>
  )
}

test('mostra o titulo do post criado na confirmacao', () => {
  render(
    <PostCreatedDialog post={post} onViewPost={vi.fn()} onBackToAdmin={vi.fn()} onCreateAnother={vi.fn()} />,
  )

  expect(screen.getByRole('dialog')).toHaveTextContent('Meu Post Novo')
})

test('clicar em "Ver post" chama onViewPost', () => {
  const onViewPost = vi.fn()
  render(
    <PostCreatedDialog
      post={post}
      onViewPost={onViewPost}
      onBackToAdmin={vi.fn()}
      onCreateAnother={vi.fn()}
    />,
  )

  fireEvent.click(screen.getByRole('button', { name: 'Ver post' }))

  expect(onViewPost).toHaveBeenCalledTimes(1)
})

test('clicar em "Voltar à administração" chama onBackToAdmin', () => {
  const onBackToAdmin = vi.fn()
  render(
    <PostCreatedDialog
      post={post}
      onViewPost={vi.fn()}
      onBackToAdmin={onBackToAdmin}
      onCreateAnother={vi.fn()}
    />,
  )

  fireEvent.click(screen.getByRole('button', { name: 'Voltar à administração' }))

  expect(onBackToAdmin).toHaveBeenCalledTimes(1)
})

test('clicar em "Criar outro" chama onCreateAnother', () => {
  const onCreateAnother = vi.fn()
  render(
    <PostCreatedDialog
      post={post}
      onViewPost={vi.fn()}
      onBackToAdmin={vi.fn()}
      onCreateAnother={onCreateAnother}
    />,
  )

  fireEvent.click(screen.getByRole('button', { name: 'Criar outro' }))

  expect(onCreateAnother).toHaveBeenCalledTimes(1)
})

test('ao abrir, o foco vai para "Ver post" (acao principal)', () => {
  render(
    <PostCreatedDialog post={post} onViewPost={vi.fn()} onBackToAdmin={vi.fn()} onCreateAnother={vi.fn()} />,
  )

  expect(screen.getByRole('button', { name: 'Ver post' })).toHaveFocus()
})

test('ao fechar, o foco volta para quem abriu o dialogo', () => {
  render(<Harness onViewPost={vi.fn()} onBackToAdmin={vi.fn()} onCreateAnother={vi.fn()} />)

  const trigger = screen.getByRole('button', { name: 'Salvar' })
  trigger.focus()
  fireEvent.click(trigger)

  expect(screen.getByRole('button', { name: 'Ver post' })).toHaveFocus()

  fireEvent.click(screen.getByRole('button', { name: 'Criar outro' }))

  expect(trigger).toHaveFocus()
})

test('Escape fecha o dialogo como "Criar outro" (fica no formulario limpo)', () => {
  const onCreateAnother = vi.fn()
  const onBackToAdmin = vi.fn()
  render(
    <PostCreatedDialog
      post={post}
      onViewPost={vi.fn()}
      onBackToAdmin={onBackToAdmin}
      onCreateAnother={onCreateAnother}
    />,
  )

  fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })

  expect(onCreateAnother).toHaveBeenCalledTimes(1)
  expect(onBackToAdmin).not.toHaveBeenCalled()
})

test('Tab em "Criar outro" (ultimo botao) volta para "Ver post"', () => {
  render(
    <PostCreatedDialog post={post} onViewPost={vi.fn()} onBackToAdmin={vi.fn()} onCreateAnother={vi.fn()} />,
  )

  const last = screen.getByRole('button', { name: 'Criar outro' })
  last.focus()
  fireEvent.keyDown(last, { key: 'Tab' })

  expect(screen.getByRole('button', { name: 'Ver post' })).toHaveFocus()
})
