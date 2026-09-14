import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { expect, test } from 'vitest'
import { NotFoundPage } from './NotFoundPage'

function renderPage() {
  return render(
    <MemoryRouter>
      <NotFoundPage />
    </MemoryRouter>,
  )
}

test('mostra uma mensagem explicando que a pagina nao foi encontrada', () => {
  renderPage()

  expect(screen.getByRole('heading', { name: /página não encontrada/i })).toBeInTheDocument()
})

test('tem um link acessivel que volta para a home', () => {
  renderPage()

  const link = screen.getByRole('link', { name: /voltar para a página inicial/i })
  expect(link).toHaveAttribute('href', '/')
})

test('explica que o endereco nao existe e esconde o "404" decorativo do leitor de tela', () => {
  renderPage()

  expect(screen.getByText('O endereço não existe ou foi movido.')).toBeInTheDocument()
  expect(screen.getByText('404')).toHaveAttribute('aria-hidden', 'true')
})
