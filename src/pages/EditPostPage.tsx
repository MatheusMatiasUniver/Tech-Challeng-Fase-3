import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { AsyncState } from '../components/feedback/AsyncState'
import { PostForm, type PostFormStatus, type PostFormValues } from '../components/forms/PostForm'
import { PostEditorLayout } from '../components/posts/PostEditorLayout'
import { getDisplayName } from '../features/auth/session'
import { useAuth } from '../features/auth/useAuth'
import { postCommands as defaultPostCommands, type PostCommands } from '../features/posts/postCommands'
import { postQueries as defaultPostQueries, type PostQueries } from '../features/posts/postQueries'
import type { Post } from '../types/api'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type LoadState =
  | { status: 'loading' }
  | { status: 'invalid' }
  | { status: 'not-found' }
  | { status: 'forbidden' }
  | { status: 'error'; message: string }
  | { status: 'ready'; post: Post }

export interface EditPostPageProps {
  postQueries?: Pick<PostQueries, 'getById'>
  postCommands?: Pick<PostCommands, 'update'>
}

const BlockedBox = styled.div`
  padding: 26px;
  background: var(--error-bg);
  border: 1px solid var(--accent-soft);
  border-radius: 14px;
`

const BlockedText = styled.p`
  margin: 0 0 16px;
  font-size: 16px;
  color: var(--error);
`

const AdminButton = styled(Link)`
  display: inline-block;
  padding: 11px 18px;
  border-radius: 10px;
  background: var(--accent);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;

  &:focus-visible {
    outline: 2px solid var(--ink);
    outline-offset: 2px;
  }
`

function Blocked({ message }: { message: string }) {
  return (
    <BlockedBox role="alert">
      <BlockedText>{message}</BlockedText>
      <AdminButton to="/admin">Voltar para a administração</AdminButton>
    </BlockedBox>
  )
}

function loadPost(
  postQueries: Pick<PostQueries, 'getById'>,
  id: string,
  currentUserId: string | undefined,
  onDone: (state: LoadState) => void,
): void {
  postQueries.getById(id).then(
    (post) => {
      if (post.authorId !== currentUserId) {
        onDone({ status: 'forbidden' })
      } else {
        onDone({ status: 'ready', post })
      }
    },
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

export function EditPostPage({
  postQueries = defaultPostQueries,
  postCommands = defaultPostCommands,
}: EditPostPageProps) {
  const { postId: id } = useParams<'postId'>()
  const { session } = useAuth()
  const navigate = useNavigate()
  const isValidId = typeof id === 'string' && UUID_PATTERN.test(id)

  const [loadState, setLoadState] = useState<LoadState>(() =>
    isValidId ? { status: 'loading' } : { status: 'invalid' },
  )
  const [saveStatus, setSaveStatus] = useState<PostFormStatus>('idle')
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    if (!isValidId || !id) {
      return
    }

    let ignore = false
    loadPost(postQueries, id, session?.userId, (next) => {
      if (!ignore) setLoadState(next)
    })

    return () => {
      ignore = true
    }
  }, [id, isValidId, postQueries, session?.userId])

  function handleRetry() {
    if (!id) {
      return
    }
    setLoadState({ status: 'loading' })
    loadPost(postQueries, id, session?.userId, setLoadState)
  }

  function handleSubmit(values: PostFormValues) {
    if (!id) {
      return
    }
    setSaveStatus('loading')
    postCommands.update(id, values).then(
      () => {
        setSaveStatus('success')
        navigate(`/posts/${id}`)
      },
      (error: unknown) => {
        const status = (error as { status?: number | null } | null)?.status
        setSaveError(
          status === 403
            ? 'Você não tem permissão para editar este post.'
            : error instanceof Error
              ? error.message
              : 'Erro inesperado.',
        )
        setSaveStatus('error')
      },
    )
  }

  function renderState() {
    if (loadState.status === 'loading') {
      return <AsyncState status="loading" label="Carregando post..." />
    }

    if (loadState.status === 'invalid' || loadState.status === 'not-found') {
      return <Blocked message="Este post não existe ou foi removido." />
    }

    if (loadState.status === 'forbidden') {
      return <Blocked message="Este post é de outro autor. Você não tem permissão para editá-lo." />
    }

    if (loadState.status === 'error') {
      return <AsyncState status="error" message={loadState.message} onRetry={handleRetry} />
    }

    return (
      <PostForm
        status={saveStatus}
        errorMessage={saveError}
        initialValues={{ title: loadState.post.title, content: loadState.post.content }}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/admin')}
      />
    )
  }

  return (
    <PostEditorLayout title="Editar post" authorName={getDisplayName(session)}>
      {renderState()}
    </PostEditorLayout>
  )
}
