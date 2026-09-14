import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { AsyncState } from '../components/feedback/AsyncState'
import { StatusMessage } from '../components/feedback/StatusMessage'
import { AdminPostList } from '../components/posts/AdminPostList'
import { DeletePostDialog } from '../components/posts/DeletePostDialog'
import { useAuth } from '../features/auth/useAuth'
import { postCommands as defaultPostCommands, type PostCommands } from '../features/posts/postCommands'
import { postQueries as defaultPostQueries, type PostQueries } from '../features/posts/postQueries'
import type { Post } from '../types/api'

type ListState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; posts: Post[] }

type Announcement = { tone: 'info' | 'error'; message: string } | null

const Header = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 28px;
`

const Title = styled.h1`
  margin: 0;
  font-size: clamp(34px, 5vw, 48px);
  line-height: 1.05;
`

const Subtitle = styled.p`
  margin: 10px 0 0;
  font-size: 16px;
  color: var(--text);
`

const accentButton = `
  display: inline-block;
  border-radius: 10px;
  background: var(--accent);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;

  &:hover {
    background: var(--ink);
  }

  &:focus-visible {
    outline: 2px solid var(--ink);
    outline-offset: 2px;
  }
`

const NewPostLink = styled(Link)`
  ${accentButton}
  padding: 13px 22px;
  white-space: nowrap;
`

const Announcement = styled.div<{ $tone: 'info' | 'error' }>`
  margin: 0 0 20px;
  padding: 13px 16px;
  border-radius: 10px;
  font-size: 15px;
  background: ${({ $tone }) => ($tone === 'error' ? 'var(--error-bg)' : 'var(--surface)')};
  border: 1px solid ${({ $tone }) => ($tone === 'error' ? 'var(--accent-soft)' : 'var(--border)')};

  p {
    color: ${({ $tone }) => ($tone === 'error' ? 'var(--error)' : 'var(--text-body)')};
  }
`

const EmptyState = styled.div`
  padding: 44px 24px;
  border: 1px dashed var(--border-strong);
  border-radius: 14px;
  text-align: center;
`

const EmptyText = styled.p`
  margin: 0 0 18px;
  font-size: 17px;
  color: var(--text);
`

const FirstPostLink = styled(Link)`
  ${accentButton}
  padding: 12px 22px;
`

export interface AdminPageProps {
  postQueries?: Pick<PostQueries, 'list'>
  postCommands?: Pick<PostCommands, 'remove'>
}

function loadList(postQueries: Pick<PostQueries, 'list'>, onDone: (state: ListState) => void): void {
  postQueries.list().then(
    (posts) => onDone({ status: 'ready', posts }),
    (error: unknown) => {
      onDone({
        status: 'error',
        message: error instanceof Error ? error.message : 'Erro inesperado.',
      })
    },
  )
}

export function AdminPage({
  postQueries = defaultPostQueries,
  postCommands = defaultPostCommands,
}: AdminPageProps) {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [listState, setListState] = useState<ListState>({ status: 'loading' })
  const [postPendingDelete, setPostPendingDelete] = useState<Post | null>(null)
  const [announcement, setAnnouncement] = useState<Announcement>(null)

  useEffect(() => {
    let ignore = false
    loadList(postQueries, (next) => {
      if (!ignore) setListState(next)
    })
    return () => {
      ignore = true
    }
  }, [postQueries])

  const myPosts =
    listState.status === 'ready'
      ? listState.posts.filter((post) => post.authorId === session?.userId)
      : []

  function handleRetry() {
    setListState({ status: 'loading' })
    loadList(postQueries, setListState)
  }

  function handleEdit(post: Post) {
    navigate(`/admin/posts/${post.id}/edit`)
  }

  function handleDeleteRequest(post: Post) {
    setAnnouncement(null)
    setPostPendingDelete(post)
  }

  function handleCancelDelete() {
    setPostPendingDelete(null)
  }

  function handleConfirmDelete() {
    const post = postPendingDelete
    if (!post) {
      return
    }

    postCommands.remove(post.id).then(
      () => {
        setPostPendingDelete(null)
        setListState((current) =>
          current.status === 'ready'
            ? { status: 'ready', posts: current.posts.filter((item) => item.id !== post.id) }
            : current,
        )
        setAnnouncement({ tone: 'info', message: 'Post excluído com sucesso.' })
      },
      (error: unknown) => {
        setPostPendingDelete(null)
        const status = (error as { status?: number | null } | null)?.status

        if (status === 403) {
          setAnnouncement({
            tone: 'error',
            message: 'Você não tem permissão para excluir este post.',
          })
          loadList(postQueries, setListState)
          return
        }

        if (status === 404) {
          setAnnouncement({ tone: 'error', message: 'Este post já havia sido removido.' })
          loadList(postQueries, setListState)
          return
        }

        setAnnouncement({
          tone: 'error',
          message: error instanceof Error ? error.message : 'Erro inesperado.',
        })
      },
    )
  }

  return (
    <div>
      <Header>
        <div>
          <Title>Administração</Title>
          <Subtitle>Seus posts. Só você pode editar e excluir estes conteúdos.</Subtitle>
        </div>
        <NewPostLink to="/admin/posts/new">+ Novo post</NewPostLink>
      </Header>
      {announcement ? (
        <Announcement $tone={announcement.tone}>
          <StatusMessage tone={announcement.tone}>{announcement.message}</StatusMessage>
        </Announcement>
      ) : null}

      {listState.status === 'loading' ? (
        <AsyncState status="loading" label="Carregando posts..." />
      ) : null}
      {listState.status === 'error' ? (
        <AsyncState status="error" message={listState.message} onRetry={handleRetry} />
      ) : null}
      {listState.status === 'ready' && myPosts.length === 0 ? (
        <EmptyState>
          <EmptyText>Você ainda não publicou nenhum post.</EmptyText>
          <FirstPostLink to="/admin/posts/new">+ Criar o primeiro post</FirstPostLink>
        </EmptyState>
      ) : null}
      {listState.status === 'ready' && myPosts.length > 0 ? (
        <AdminPostList posts={myPosts} onEdit={handleEdit} onDelete={handleDeleteRequest} />
      ) : null}

      {postPendingDelete ? (
        <DeletePostDialog
          post={postPendingDelete}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      ) : null}
    </div>
  )
}
