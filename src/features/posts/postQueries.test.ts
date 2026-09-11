import { AxiosError, type AxiosAdapter } from 'axios'
import { expect, test } from 'vitest'
import { createHttpClient } from '../../services/httpClient'
import { createPostQueries } from './postQueries'
import type { Post } from '../../types/api'

const samplePost: Post = {
  id: 'post-1',
  title: 'Titulo',
  content: 'Conteudo',
  authorId: 'user-1',
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
}

function jsonAdapter(status: number, data: unknown): AxiosAdapter {
  return async (config) => ({
    data,
    status,
    statusText: 'OK',
    headers: { 'content-type': 'application/json' },
    config,
  })
}

function httpErrorAdapter(status: number, data: unknown, code: string): AxiosAdapter {
  return async (config) => {
    throw new AxiosError('Request failed', code, config, undefined, {
      status,
      statusText: 'Error',
      data,
      headers: {},
      config,
    })
  }
}

function capturingAdapter(response: unknown): { adapter: AxiosAdapter; getUrl: () => string | undefined } {
  let capturedUrl: string | undefined
  const adapter: AxiosAdapter = async (config) => {
    capturedUrl = config.url
    return {
      data: response,
      status: 200,
      statusText: 'OK',
      headers: { 'content-type': 'application/json' },
      config,
    }
  }
  return { adapter, getUrl: () => capturedUrl }
}

test('list() faz GET /posts e devolve a lista', async () => {
  const { adapter, getUrl } = capturingAdapter([samplePost])
  const queries = createPostQueries(createHttpClient({ adapter }))

  const posts = await queries.list()

  expect(getUrl()).toBe('/posts')
  expect(posts).toEqual([samplePost])
})

test('list() aceita post sem "author"', async () => {
  const client = createHttpClient({ adapter: jsonAdapter(200, [samplePost]) })
  const posts = await createPostQueries(client).list()

  expect(posts[0].author).toBeUndefined()
})

test('search(termo) apara espacos e faz GET /posts/search?q=termo', async () => {
  const { adapter, getUrl } = capturingAdapter([samplePost])
  const queries = createPostQueries(createHttpClient({ adapter }))

  const posts = await queries.search('  react  ')

  expect(getUrl()).toBe('/posts/search?q=react')
  expect(posts).toEqual([samplePost])
})

test('search com termo vazio ou so espacos nao chama o httpClient', async () => {
  const neverCalled: AxiosAdapter = async () => {
    throw new Error('httpClient nao deveria ser chamado para busca vazia')
  }
  const queries = createPostQueries(createHttpClient({ adapter: neverCalled }))

  await expect(queries.search('')).resolves.toEqual([])
  await expect(queries.search('   ')).resolves.toEqual([])
})

test('getById(id) faz GET /posts/:id e devolve o post', async () => {
  const { adapter, getUrl } = capturingAdapter(samplePost)
  const queries = createPostQueries(createHttpClient({ adapter }))

  const post = await queries.getById('post-1')

  expect(getUrl()).toBe('/posts/post-1')
  expect(post).toEqual(samplePost)
})

test('getById com post inexistente rejeita com erro 404', async () => {
  const client = createHttpClient({
    adapter: httpErrorAdapter(404, { message: 'Post nao encontrado' }, 'ERR_BAD_REQUEST'),
  })

  await expect(createPostQueries(client).getById('post-inexistente')).rejects.toMatchObject({
    status: 404,
    message: 'Post nao encontrado',
  })
})

test('falha de rede em list() rejeita com status null', async () => {
  const client = createHttpClient({
    adapter: async () => {
      throw new AxiosError('Network Error', 'ERR_NETWORK')
    },
  })

  await expect(createPostQueries(client).list()).rejects.toMatchObject({ status: null })
})
