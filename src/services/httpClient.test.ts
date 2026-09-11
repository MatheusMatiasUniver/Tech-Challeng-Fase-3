import { AxiosError, type AxiosAdapter } from 'axios'
import { expect, test, vi } from 'vitest'
import { createHttpClient } from './httpClient'

function jsonAdapter(
  status: number,
  data: unknown,
  statusText = 'OK',
): AxiosAdapter {
  return async (config) => ({
    data,
    status,
    statusText,
    headers: { 'content-type': 'application/json' },
    config,
  })
}

function httpErrorAdapter(
  status: number,
  data: unknown,
  code: string,
): AxiosAdapter {
  return async (config) => {
    throw new AxiosError(
      'Request failed',
      code,
      config,
      undefined,
      {
        status,
        statusText: 'Error',
        data,
        headers: {},
        config,
      },
    )
  }
}

const invalidJsonAdapter: AxiosAdapter = async (config) => {
  throw new AxiosError(
    'Unexpected token',
    AxiosError.ERR_BAD_RESPONSE,
    config,
  )
}

const networkErrorAdapter: AxiosAdapter = async (config) => {
  throw new AxiosError('Network Error', AxiosError.ERR_NETWORK, config)
}

test('get returns parsed JSON on 200', async () => {
  const client = createHttpClient({
    adapter: jsonAdapter(200, [{ id: '1', title: 'Olá' }]),
  })

  await expect(client.get('/posts')).resolves.toEqual([
    { id: '1', title: 'Olá' },
  ])
})

test('delete returns undefined on 204 without reading a body', async () => {
  const client = createHttpClient({
    adapter: jsonAdapter(204, '', 'No Content'),
  })

  await expect(client.delete('/posts/1')).resolves.toBeUndefined()
})

test('invalid JSON becomes ApiError', async () => {
  const client = createHttpClient({
    adapter: invalidJsonAdapter,
  })

  await expect(client.get('/posts')).rejects.toMatchObject({
    status: null,
    message: expect.any(String),
  })
})

test('400 maps { message } to ApiError', async () => {
  const client = createHttpClient({
    adapter: httpErrorAdapter(400, { message: 'Título obrigatório' }, 'ERR_BAD_REQUEST'),
  })

  await expect(client.post('/posts', { title: '', content: 'x' })).rejects.toMatchObject({
    status: 400,
    message: 'Título obrigatório',
  })
})

test('401 on a Bearer request calls onUnauthorized and becomes ApiError', async () => {
  const onUnauthorized = vi.fn()
  const client = createHttpClient({
    getAccessToken: () => 'jwt-secreto',
    onUnauthorized,
    adapter: httpErrorAdapter(401, { message: 'Não autorizado' }, 'ERR_BAD_REQUEST'),
  })

  await expect(client.get('/posts')).rejects.toMatchObject({
    status: 401,
    message: 'Não autorizado',
  })
  expect(onUnauthorized).toHaveBeenCalledOnce()
})

test('network failure becomes ApiError with null status', async () => {
  const client = createHttpClient({
    adapter: networkErrorAdapter,
  })

  await expect(client.get('/posts')).rejects.toMatchObject({
    status: null,
    message: expect.any(String),
  })
})

test('sends JSON Content-Type and Bearer when a token exists', async () => {
  const seen: { authorization?: string; contentType?: string } = {}

  const inspectHeaders: AxiosAdapter = async (config) => {
    const authorization = config.headers.get('Authorization')
    const contentType = config.headers.get('Content-Type')
    seen.authorization =
      typeof authorization === 'string' ? authorization : undefined
    seen.contentType = typeof contentType === 'string' ? contentType : undefined
    return {
      data: { ok: true },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    }
  }

  const client = createHttpClient({
    getAccessToken: () => 'jwt-secreto',
    adapter: inspectHeaders,
  })

  await client.post('/posts', { title: 'A', content: 'B' })

  expect(seen.authorization).toBe('Bearer jwt-secreto')
  expect(seen.contentType).toMatch(/application\/json/)
})

test('does not log the access token', async () => {
  const log = vi.spyOn(console, 'log').mockImplementation(() => {})
  const error = vi.spyOn(console, 'error').mockImplementation(() => {})
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

  const client = createHttpClient({
    getAccessToken: () => 'jwt-secreto',
    adapter: jsonAdapter(200, { ok: true }),
  })

  await client.get('/posts')

  const dumped = [...log.mock.calls, ...error.mock.calls, ...warn.mock.calls]
    .flat()
    .join(' ')

  expect(dumped).not.toContain('jwt-secreto')
  log.mockRestore()
  error.mockRestore()
  warn.mockRestore()
})
