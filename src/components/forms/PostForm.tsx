import { useState, type FormEvent } from 'react'
import styled from 'styled-components'
import { StatusMessage } from '../feedback/StatusMessage'
import { FormField } from './FormField'

export type PostFormStatus = 'idle' | 'loading' | 'success' | 'error'

export interface PostFormValues {
  title: string
  content: string
}

export interface PostFormProps {
  initialValues?: PostFormValues
  status: PostFormStatus
  errorMessage?: string
  onSubmit: (values: PostFormValues) => void
}

const TITLE_MAX_LENGTH = 255

interface FieldErrors {
  title?: string
  content?: string
}

function validate(values: PostFormValues): FieldErrors {
  const errors: FieldErrors = {}

  if (values.title.length === 0) {
    errors.title = 'Informe um titulo.'
  } else if (values.title.length > TITLE_MAX_LENGTH) {
    errors.title = `O titulo deve ter no maximo ${TITLE_MAX_LENGTH} caracteres.`
  }

  if (values.content.length === 0) {
    errors.content = 'Informe o conteudo do post.'
  }

  return errors
}

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 40rem;
`

const Input = styled.input`
  font: inherit;
  padding: 0.5rem;
  border: 1px solid var(--border);
  border-radius: 4px;
`

const TextArea = styled.textarea`
  min-height: 10rem;
  font: inherit;
  padding: 0.5rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  resize: vertical;
`

const SubmitButton = styled.button`
  align-self: flex-start;
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 0.55rem 1.25rem;
  font: inherit;
  cursor: pointer;
  background: transparent;
  color: var(--text-h);

  &:hover:not(:disabled) {
    border-color: var(--accent);
    color: var(--accent);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

export function PostForm({ initialValues, status, errorMessage, onSubmit }: PostFormProps) {
  const [values, setValues] = useState<PostFormValues>(initialValues ?? { title: '', content: '' })
  const [errors, setErrors] = useState<FieldErrors>({})
  const isLoading = status === 'loading'

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedValues: PostFormValues = {
      title: values.title.trim(),
      content: values.content.trim(),
    }
    const fieldErrors = validate(trimmedValues)
    setErrors(fieldErrors)

    if (Object.keys(fieldErrors).length > 0) {
      return
    }

    onSubmit(trimmedValues)
  }

  return (
    <Form onSubmit={handleSubmit} noValidate>
      <FormField id="post-title" label="Titulo" error={errors.title}>
        <Input
          type="text"
          value={values.title}
          disabled={isLoading}
          onChange={(event) => {
            const title = event.target.value
            setValues((current) => ({ ...current, title }))
            setErrors((current) => ({ ...current, title: undefined }))
          }}
        />
      </FormField>
      <FormField id="post-content" label="Conteudo" error={errors.content}>
        <TextArea
          value={values.content}
          disabled={isLoading}
          onChange={(event) => {
            const content = event.target.value
            setValues((current) => ({ ...current, content }))
            setErrors((current) => ({ ...current, content: undefined }))
          }}
        />
      </FormField>
      {status === 'error' && errorMessage ? (
        <StatusMessage tone="error">{errorMessage}</StatusMessage>
      ) : null}
      <SubmitButton type="submit" disabled={isLoading}>
        {isLoading ? 'Salvando...' : 'Salvar'}
      </SubmitButton>
    </Form>
  )
}
