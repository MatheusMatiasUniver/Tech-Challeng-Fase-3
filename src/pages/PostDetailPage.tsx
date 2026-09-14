import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { AsyncState } from '../components/feedback/AsyncState'
import { postQueries as defaultPostQueries, type PostQueries } from '../features/posts/postQueries'
import type { Post } from '../types/api'
import { formatPostMeta } from '../utils/postMeta'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type ViewState =
  | { status: 'loading' }
  | { status: 'invalid' }
  | { status: 'not-found' }
  | { status: 'error'; message: string }
  | { status: 'success'; post: Post }

export interface PostDetailPageProps {
  postQueries?: Pick<PostQueries, 'getById'>
}

const Article = styled.article`
  max-width: 720px;
  margin: 0 auto;
`

const BackLink = styled(Link)`
  display: inline-block;
  margin-bottom: 26px;
  padding: 6px 0;
  font-size: 15px;
  font-weight: 500;
  color: var(--text);
  text-decoration: none;

  &:hover {
    color: var(--accent);
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 3px;
  }
`

const Title = styled.h1`
  margin: 0;
  font-size: clamp(34px, 5.4vw, 54px);
  line-height: 1.06;
  letter-spacing: -0.02em;
  text-wrap: pretty;
  overflow-wrap: anywhere;
`

const Meta = styled.p`
  margin: 18px 0 0;
  padding-bottom: 22px;
  border-bottom: 1px solid var(--border);
  font-size: 14px;
  color: var(--muted);
`

const Content = styled.div`
  margin-top: 28px;
  font-size: 18px;
  line-height: 1.78;
  color: var(--text-body);
  white-space: pre-wrap;
  text-wrap: pretty;
  overflow-wrap: anywhere;
`

const NotFoundCard = styled.div`
  padding: 28px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
`

const NotFoundTitle = styled.h1`
  margin: 0 0 10px;
  font-size: 32px;
  line-height: normal;
`

const NotFoundText = styled.p`
  margin: 0 0 16px;
  font-size: 16px;
  color: var(--text);
`

const HomeButton = styled(Link)`
  display: inline-block;
  padding: 11px 18px;
  border-radius: 10px;
  background: var(--ink);
  color: var(--on-ink);
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;

  &:hover {
    background: var(--accent);
  }

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
`

function fetchPost(
  postQueries: Pick<PostQueries, 'getById'>,
  id: string,
  onDone: (state: ViewState) => void,
): void {
  postQueries.getById(id).then(
    (post) => onDone({ status: 'success', post }),
    (error: unknown) => {
      const status = (error as { status?: number | null } | null)?.status
      if (status === 404) {
        onDone({ status: 'not-found' })
      } else {
        onDone({
          status: 'error',
          message: error instanceof Error ? error.message : 'Erro inesperado.',
        })
      }
    },
  )
}

export function PostDetailPage({ postQueries = defaultPostQueries }: PostDetailPageProps) {
  const { postId: id } = useParams<'postId'>()
  const isValidId = typeof id === 'string' && UUID_PATTERN.test(id)

  const [state, setState] = useState<ViewState>(() =>
    isValidId ? { status: 'loading' } : { status: 'invalid' },
  )

  useEffect(() => {
    if (!isValidId || !id) {
      return
    }

    let ignore = false
    fetchPost(postQueries, id, (next) => {
      if (!ignore) setState(next)
    })

    return () => {
      ignore = true
    }
  }, [id, isValidId, postQueries])

  function handleRetry() {
    if (!id) {
      return
    }
    setState({ status: 'loading' })
    fetchPost(postQueries, id, setState)
  }

  function renderState() {
    if (state.status === 'loading') {
      return <AsyncState status="loading" label="Carregando post..." />
    }

    if (state.status === 'invalid' || state.status === 'not-found') {
      return (
        <NotFoundCard role="alert">
          <NotFoundTitle>Post não encontrado</NotFoundTitle>
          <NotFoundText>Ele pode ter sido removido pelo autor.</NotFoundText>
          <HomeButton to="/">Voltar para a página inicial</HomeButton>
        </NotFoundCard>
      )
    }

    if (state.status === 'error') {
      return <AsyncState status="error" message={state.message} onRetry={handleRetry} />
    }

    const { post } = state

    return (
      <>
        <Title>{post.title}</Title>
        <Meta>{formatPostMeta(post)}</Meta>
        <Content>{post.content}</Content>
      </>
    )
  }

  return (
    <Article>
      <BackLink to="/">← Voltar para a lista</BackLink>
      {renderState()}
    </Article>
  )
}
