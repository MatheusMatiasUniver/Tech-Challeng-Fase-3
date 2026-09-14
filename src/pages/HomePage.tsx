import { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { AsyncState } from '../components/feedback/AsyncState'
import { PostList } from '../components/posts/PostList'
import { SearchForm } from '../components/posts/SearchForm'
import { postQueries as defaultPostQueries, type PostQueries } from '../features/posts/postQueries'
import type { Post } from '../types/api'

type RequestStatus = 'loading' | 'success' | 'error'

const Eyebrow = styled.h1`
  margin: 0 0 10px;
  font-family: var(--sans);
  font-size: 13px;
  font-weight: 600;
  line-height: normal;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--muted);
`

const SearchArea = styled.div`
  margin-bottom: 34px;
`

export interface HomePageProps {
  postQueries?: Pick<PostQueries, 'list' | 'search'>
}

export function HomePage({ postQueries = defaultPostQueries }: HomePageProps) {
  const [status, setStatus] = useState<RequestStatus>('loading')
  const [posts, setPosts] = useState<Post[]>([])
  const [errorMessage, setErrorMessage] = useState('')
  const [activeSearch, setActiveSearch] = useState<string | null>(null)
  const latestRequest = useRef({ id: 0 })

  const loadAll = useCallback(async () => {
    const requestId = ++latestRequest.current.id
    try {
      const result = await postQueries.list()
      if (requestId !== latestRequest.current.id) return
      setPosts(result)
      setStatus('success')
    } catch (error) {
      if (requestId !== latestRequest.current.id) return
      setErrorMessage(error instanceof Error ? error.message : 'Erro inesperado.')
      setStatus('error')
    }
  }, [postQueries])

  const runSearch = useCallback(
    async (term: string) => {
      const requestId = ++latestRequest.current.id
      try {
        const result = await postQueries.search(term)
        if (requestId !== latestRequest.current.id) return
        setPosts(result)
        setStatus('success')
      } catch (error) {
        if (requestId !== latestRequest.current.id) return
        setErrorMessage(error instanceof Error ? error.message : 'Erro inesperado.')
        setStatus('error')
      }
    },
    [postQueries],
  )

  useEffect(() => {
    const requests = latestRequest.current
    const requestId = ++requests.id

    postQueries.list().then(
      (result) => {
        if (requestId !== requests.id) return
        setPosts(result)
        setStatus('success')
      },
      (error: unknown) => {
        if (requestId !== requests.id) return
        setErrorMessage(error instanceof Error ? error.message : 'Erro inesperado.')
        setStatus('error')
      },
    )

    return () => {
      requests.id++
    }
  }, [postQueries])

  function handleSearch(term: string) {
    setStatus('loading')
    setActiveSearch(term)
    runSearch(term)
  }

  function handleClear() {
    setStatus('loading')
    setActiveSearch(null)
    loadAll()
  }

  function handleRetry() {
    setStatus('loading')
    if (activeSearch) {
      runSearch(activeSearch)
    } else {
      loadAll()
    }
  }

  return (
    <div>
      <Eyebrow>Conteúdo aberto</Eyebrow>
      <SearchArea>
        <SearchForm onSearch={handleSearch} onClear={handleClear} />
      </SearchArea>
      {status === 'loading' ? <AsyncState status="loading" label="Carregando posts..." /> : null}
      {status === 'error' ? (
        <AsyncState status="error" message={errorMessage} onRetry={handleRetry} />
      ) : null}
      {status === 'success' && posts.length === 0 ? (
        <AsyncState
          status="empty"
          label={
            activeSearch ? `Nenhum resultado para "${activeSearch}".` : 'Nenhum post encontrado.'
          }
        />
      ) : null}
      {status === 'success' && posts.length > 0 ? <PostList posts={posts} /> : null}
    </div>
  )
}
