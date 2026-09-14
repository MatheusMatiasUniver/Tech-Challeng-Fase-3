import type { KeyboardEvent } from 'react'

export function keepFocusInside(event: KeyboardEvent, container: HTMLElement | null): void {
  if (event.key !== 'Tab' || !container) {
    return
  }

  const buttons = container.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')
  if (buttons.length === 0) {
    return
  }

  const first = buttons[0]
  const last = buttons[buttons.length - 1]

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}
