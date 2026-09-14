import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PostForm, type PostFormStatus, type PostFormValues } from '../components/forms/PostForm'
import { PostCreatedDialog } from '../components/posts/PostCreatedDialog'
import { PostEditorLayout } from '../components/posts/PostEditorLayout'
import { getDisplayName } from '../features/auth/session'
import { useAuth } from '../features/auth/useAuth'
import { postCommands as defaultPostCommands, type PostCommands } from '../features/posts/postCommands'
import type { Post } from '../types/api'

export interface CreatePostPageProps {
  postCommands?: Pick<PostCommands, 'create'>
}

export function CreatePostPage({ postCommands = defaultPostCommands }: CreatePostPageProps) {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [status, setStatus] = useState<PostFormStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [createdPost, setCreatedPost] = useState<Post | null>(null)
  const [formKey, setFormKey] = useState(0)

  function handleSubmit(values: PostFormValues) {
    setStatus('loading')
    postCommands.create(values).then(
      (created) => {
        setStatus('success')
        setCreatedPost(created)
      },
      (error: unknown) => {
        setErrorMessage(error instanceof Error ? error.message : 'Erro inesperado.')
        setStatus('error')
      },
    )
  }

  function handleCreateAnother() {
    setCreatedPost(null)
    setStatus('idle')
    setErrorMessage('')
    setFormKey((key) => key + 1)
  }

  return (
    <PostEditorLayout title="Criar post" authorName={getDisplayName(session)}>
      <PostForm
        key={formKey}
        status={status}
        errorMessage={errorMessage}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/admin')}
      />
      {createdPost ? (
        <PostCreatedDialog
          post={createdPost}
          onViewPost={() => navigate(`/posts/${createdPost.id}`)}
          onBackToAdmin={() => navigate('/admin')}
          onCreateAnother={handleCreateAnother}
        />
      ) : null}
    </PostEditorLayout>
  )
}
