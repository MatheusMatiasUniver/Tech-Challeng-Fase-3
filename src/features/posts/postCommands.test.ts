import { AxiosError, type AxiosAdapter } from 'axios'
import { expect, test } from 'vitest'
import { createHttpClient } from '../../services/httpClient'
import { createPostCommands } from './postCommands'
import type { Post } from '../../types/api'

const samplePost: Post = {
  id: 'post-1',
  title: 'Titulo',
  content: 'Conteudo',
  authorId: 'user-1',
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
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

function capturingAdapter(
  status: number,
  data: unknown,
): {
  adapter: AxiosAdapter
  getUrl: () => string | undefined
  getMethod: () => string | undefined
  getBody: () => unknown
  getAuthorization: () => string | undefined
} {
  let url: string | undefined
  let method: string | undefined
  let body: unknown
  let authorization: string | undefined

  const adapter: AxiosAdapter = async (config) => {
    url = config.url
    method = config.method
    body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data
    const header = config.headers.get('Authorization')
    authorization = typeof header === 'string' ? header : undefined

    return {
      data,
      status,
      statusText: 'OK',
      headers: { 'content-type': 'application/json' },
      config,
    }
  }

  return {
    adapter,
    getUrl: () => url,
    getMethod: () => method,
    getBody: () => body,
    getAuthorization: () => authorization,
  }
}

test('create() envia POST /posts com exatamente title e content', async () => {
  const { adapter, getUrl, getMethod, getBody } = capturingAdapter(201, samplePost)
  const commands = createPostCommands(createHttpClient({ adapter }))

  await commands.create({ title: 'Titulo', content: 'Conteudo' })

  expect(getMethod()).toBe('post')
  expect(getUrl()).toBe('/posts')
  expect(getBody()).toEqual({ title: 'Titulo', content: 'Conteudo' })
})

test('create() inclui o Bearer quando o cliente tem token', async () => {
  const { adapter, getAuthorization } = capturingAdapter(201, samplePost)
  const client = createHttpClient({ adapter, getAccessToken: () => 'jwt-secreto' })

  await createPostCommands(client).create({ title: 'Titulo', content: 'Conteudo' })

  expect(getAuthorization()).toBe('Bearer jwt-secreto')
})

test('create() devolve o post criado (201)', async () => {
  const { adapter } = capturingAdapter(201, samplePost)
  const commands = createPostCommands(createHttpClient({ adapter }))

  const post = await commands.create({ title: 'Titulo', content: 'Conteudo' })

  expect(post).toEqual(samplePost)
})

test('create() com payload invalido rejeita com erro 400', async () => {
  const client = createHttpClient({
    adapter: httpErrorAdapter(400, { message: 'Titulo obrigatorio' }, 'ERR_BAD_REQUEST'),
  })

  await expect(
    createPostCommands(client).create({ title: '', content: 'Conteudo' }),
  ).rejects.toMatchObject({ status: 400, message: 'Titulo obrigatorio' })
})

test('update() com so title faz PUT /posts/:id enviando so title', async () => {
  const { adapter, getUrl, getMethod, getBody } = capturingAdapter(200, samplePost)
  const commands = createPostCommands(createHttpClient({ adapter }))

  await commands.update('post-1', { title: 'Novo titulo' })

  expect(getMethod()).toBe('put')
  expect(getUrl()).toBe('/posts/post-1')
  expect(getBody()).toEqual({ title: 'Novo titulo' })
})

test('update() com so content envia so content', async () => {
  const { adapter, getBody } = capturingAdapter(200, samplePost)
  const commands = createPostCommands(createHttpClient({ adapter }))

  await commands.update('post-1', { content: 'Novo conteudo' })

  expect(getBody()).toEqual({ content: 'Novo conteudo' })
})

test('update() devolve o post atualizado (200)', async () => {
  const { adapter } = capturingAdapter(200, samplePost)
  const commands = createPostCommands(createHttpClient({ adapter }))

  const post = await commands.update('post-1', { title: 'Novo titulo' })

  expect(post).toEqual(samplePost)
})

test('remove() faz DELETE /posts/:id e resolve sem corpo (204)', async () => {
  let method: string | undefined
  let url: string | undefined

  const client = createHttpClient({
    adapter: async (config) => {
      method = config.method
      url = config.url
      return { data: '', status: 204, statusText: 'No Content', headers: {}, config }
    },
  })

  await expect(createPostCommands(client).remove('post-1')).resolves.toBeUndefined()
  expect(method).toBe('delete')
  expect(url).toBe('/posts/post-1')
})

test('mutacao sem token valido rejeita com 401', async () => {
  const client = createHttpClient({
    adapter: httpErrorAdapter(401, { message: 'Nao autorizado' }, 'ERR_BAD_REQUEST'),
  })

  await expect(
    createPostCommands(client).create({ title: 'Titulo', content: 'Conteudo' }),
  ).rejects.toMatchObject({ status: 401 })
})

test('mutacao em post de outro dono rejeita com 403', async () => {
  const client = createHttpClient({
    adapter: httpErrorAdapter(403, { message: 'Sem permissao' }, 'ERR_BAD_REQUEST'),
  })

  await expect(createPostCommands(client).remove('post-de-outro')).rejects.toMatchObject({
    status: 403,
    message: 'Sem permissao',
  })
})
