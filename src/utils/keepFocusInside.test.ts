import type { KeyboardEvent } from 'react'
import { expect, test, vi } from 'vitest'
import { keepFocusInside } from './keepFocusInside'

function setup() {
  const container = document.createElement('div')
  container.innerHTML = '<button>Primeiro</button><button disabled>Desabilitado</button><button>Ultimo</button>'
  document.body.appendChild(container)
  const [first, , last] = Array.from(container.querySelectorAll('button'))
  return { container, first, last }
}

function keyEvent(key: string, shiftKey = false) {
  return { key, shiftKey, preventDefault: vi.fn() } as unknown as KeyboardEvent
}

test('Tab no ultimo botao habilitado leva ao primeiro', () => {
  const { container, first, last } = setup()
  last.focus()
  const event = keyEvent('Tab')

  keepFocusInside(event, container)

  expect(first).toHaveFocus()
  expect(event.preventDefault).toHaveBeenCalled()
})

test('Shift+Tab no primeiro botao leva ao ultimo', () => {
  const { container, first, last } = setup()
  first.focus()

  keepFocusInside(keyEvent('Tab', true), container)

  expect(last).toHaveFocus()
})

test('Tab no meio do dialogo nao interfere na navegacao normal', () => {
  const { container, first } = setup()
  first.focus()
  const event = keyEvent('Tab')

  keepFocusInside(event, container)

  expect(first).toHaveFocus()
  expect(event.preventDefault).not.toHaveBeenCalled()
})

test('outras teclas sao ignoradas', () => {
  const { container, last } = setup()
  last.focus()
  const event = keyEvent('Enter')

  keepFocusInside(event, container)

  expect(event.preventDefault).not.toHaveBeenCalled()
})
