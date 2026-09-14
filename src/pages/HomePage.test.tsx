import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { expect, test, vi } from 'vitest'
import { HomePage } from './HomePage'
import type { Post } from '../types/api'

function makePost(id: string, title: string): Post {
  return {
    id,
    title,
    content: `Conteudo de ${title}.`,
    authorId: 'user-1',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
  }
}

function createDeferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

function renderHome(postQueries: { list: () => Promise<Post[]>; search: (term: string) => Promise<Post[]> }) {
  return render(
    <MemoryRouter>
      <HomePage postQueries={postQueries} />
    </MemoryRouter>,
  )
}

async function search(term: string) {
  fireEvent.change(screen.getByLabelText('Termo de busca'), { target: { value: term } })
  fireEvent.click(screen.getByRole('button', { name: 'Buscar' }))
}

test.each(['resolve', 'reject'] as const)('ignora resposta antiga (%s) depois de uma busca mais recente', async (outcome) => {
  const oldSearch = createDeferred<Post[]>()
  const searchFn = vi.fn().mockReturnValueOnce(oldSearch.promise)
    .mockResolvedValueOnce([makePost('2', 'Resultado atual')])
  renderHome({ list: vi.fn().mockResolvedValue([]), search: searchFn })
  await screen.findByText('Nenhum post encontrado.')
  await search('antiga')
  await search('atual')
  await screen.findByText('Resultado atual')

  await act(async () => {
    if (outcome === 'resolve') oldSearch.resolve([makePost('1', 'Resultado antigo')])
    else oldSearch.reject(new Error('Erro da busca antiga'))
  })

  expect(screen.getByText('Resultado atual')).toBeInTheDocument()
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})

test('lista inicial atrasada nao sobrescreve uma busca', async () => {
  const initialList = createDeferred<Post[]>()
  renderHome({ list: () => initialList.promise, search: vi.fn().mockResolvedValue([makePost('2', 'Resultado da busca')]) })
  await search('busca')
  await screen.findByText('Resultado da busca')

  await act(async () => initialList.resolve([makePost('1', 'Lista antiga')]))

  expect(screen.getByText('Resultado da busca')).toBeInTheDocument()
})

test('limpar invalida uma busca ainda pendente', async () => {
  const pendingSearch = createDeferred<Post[]>()
  renderHome({ list: vi.fn().mockResolvedValue([makePost('1', 'Lista completa')]), search: () => pendingSearch.promise })
  await screen.findByText('Lista completa')
  await search('busca')
  fireEvent.click(screen.getByRole('button', { name: 'Limpar' }))
  await screen.findByText('Lista completa')

  await act(async () => pendingSearch.resolve([makePost('2', 'Resultado descartado')]))

  expect(screen.getByText('Lista completa')).toBeInTheDocument()
  expect(screen.getByLabelText('Termo de busca')).toHaveValue('')
})

test('tem um h1 "Conteudo aberto" para a navegacao por cabecalhos', async () => {
  renderHome({ list: vi.fn().mockResolvedValue([]), search: vi.fn() })

  expect(screen.getByRole('heading', { level: 1, name: 'Conteúdo aberto' })).toBeInTheDocument()
  await screen.findByText('Nenhum post encontrado.')
})

test('ao montar, carrega e lista todos os posts', async () => {
  const list = vi.fn().mockResolvedValue([makePost('1', 'Primeiro'), makePost('2', 'Segundo')])
  renderHome({ list, search: vi.fn() })

  await waitFor(() => expect(list).toHaveBeenCalledTimes(1))
  expect(await screen.findByText('Primeiro')).toBeInTheDocument()
  expect(screen.getByText('Segundo')).toBeInTheDocument()
})

test('mostra o estado de carregamento enquanto a lista nao chega', async () => {
  const deferred = createDeferred<Post[]>()
  renderHome({ list: () => deferred.promise, search: vi.fn() })

  expect(screen.getByRole('status')).toHaveTextContent('Carregando posts...')

  deferred.resolve([makePost('1', 'Primeiro')])
  expect(await screen.findByText('Primeiro')).toBeInTheDocument()
})

test('lista vazia mostra "Nenhum post encontrado."', async () => {
  renderHome({ list: vi.fn().mockResolvedValue([]), search: vi.fn() })

  expect(await screen.findByText('Nenhum post encontrado.')).toBeInTheDocument()
})

test('buscar substitui os resultados pela busca', async () => {
  const list = vi.fn().mockResolvedValue([makePost('1', 'Post da lista')])
  const searchFn = vi.fn().mockResolvedValue([makePost('2', 'Post da busca')])
  renderHome({ list, search: searchFn })

  await screen.findByText('Post da lista')

  await search('busca')

  expect(searchFn).toHaveBeenCalledWith('busca')
  expect(await screen.findByText('Post da busca')).toBeInTheDocument()
  expect(screen.queryByText('Post da lista')).not.toBeInTheDocument()
})

test('busca sem resultado mostra uma mensagem diferente da lista vazia', async () => {
  const list = vi.fn().mockResolvedValue([makePost('1', 'Post da lista')])
  const searchFn = vi.fn().mockResolvedValue([])
  renderHome({ list, search: searchFn })

  await screen.findByText('Post da lista')
  await search('nada-aqui')

  expect(await screen.findByText('Nenhum resultado para "nada-aqui".')).toBeInTheDocument()
})

test('limpar volta a listar todos os posts', async () => {
  const list = vi.fn().mockResolvedValue([makePost('1', 'Post da lista')])
  const searchFn = vi.fn().mockResolvedValue([makePost('2', 'Post da busca')])
  renderHome({ list, search: searchFn })

  await screen.findByText('Post da lista')
  await search('busca')
  await screen.findByText('Post da busca')

  fireEvent.click(screen.getByRole('button', { name: 'Limpar' }))

  expect(await screen.findByText('Post da lista')).toBeInTheDocument()
  expect(list).toHaveBeenCalledTimes(2)
})

test('erro ao carregar a lista mostra mensagem e permite tentar novamente', async () => {
  const list = vi.fn().mockRejectedValueOnce(new Error('Falha de rede.'))
  list.mockResolvedValueOnce([makePost('1', 'Post recuperado')])

  renderHome({ list, search: vi.fn() })

  expect(await screen.findByRole('alert')).toHaveTextContent('Falha de rede.')

  fireEvent.click(screen.getByRole('button', { name: /tentar novamente/i }))

  expect(await screen.findByText('Post recuperado')).toBeInTheDocument()
  expect(list).toHaveBeenCalledTimes(2)
})

test('erro na busca mostra mensagem e o retry refaz a mesma busca', async () => {
  const list = vi.fn().mockResolvedValue([makePost('1', 'Post da lista')])
  const searchFn = vi.fn().mockRejectedValueOnce(new Error('Falha na busca.'))
  searchFn.mockResolvedValueOnce([makePost('2', 'Post encontrado')])

  renderHome({ list, search: searchFn })

  await screen.findByText('Post da lista')
  await search('termo')

  expect(await screen.findByRole('alert')).toHaveTextContent('Falha na busca.')

  fireEvent.click(screen.getByRole('button', { name: /tentar novamente/i }))

  expect(await screen.findByText('Post encontrado')).toBeInTheDocument()
  expect(searchFn).toHaveBeenLastCalledWith('termo')
})
