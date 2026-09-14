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
  onCancel?: () => void
}

const TITLE_MAX_LENGTH = 255

interface FieldErrors {
  title?: string
  content?: string
}

function validate(values: PostFormValues): FieldErrors {
  const errors: FieldErrors = {}

  if (values.title.length === 0) {
    errors.title = 'Informe um título.'
  } else if (values.title.length > TITLE_MAX_LENGTH) {
    errors.title = `O título deve ter no máximo ${TITLE_MAX_LENGTH} caracteres.`
  }

  if (values.content.length === 0) {
    errors.content = 'Informe o conteúdo do post.'
  }

  return errors
}

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 26px;
`

const fieldStyle = `
  font: inherit;
  padding: 12px 14px;
  background: var(--bg);
  color: var(--text-h);
  border: 1px solid var(--border-strong);
  border-radius: 10px;

  &:focus {
    outline: 2px solid var(--accent);
    outline-offset: 1px;
    border-color: var(--accent);
  }
`

const Input = styled.input`
  ${fieldStyle}
  font-size: 17px;
`

const TextArea = styled.textarea`
  ${fieldStyle}
  min-height: 220px;
  padding: 14px;
  font-size: 16px;
  line-height: 1.65;
  resize: vertical;
`

const ErrorBox = styled.div`
  padding: 12px 14px;
  font-size: 15px;
  background: var(--error-bg);
  border: 1px solid var(--accent-soft);
  border-radius: 10px;
`

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`

const buttonBase = `
  border-radius: 10px;
  padding: 13px 24px;
  font: inherit;
  font-size: 16px;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const SubmitButton = styled.button`
  ${buttonBase}
  border: 0;
  font-weight: 600;
  background: var(--ink);
  color: var(--on-ink);

  &:hover:not(:disabled) {
    background: var(--accent);
  }
`

const CancelButton = styled.button`
  ${buttonBase}
  padding: 13px 22px;
  border: 1px solid var(--border-strong);
  font-weight: 500;
  background: none;
  color: var(--text);

  &:hover:not(:disabled) {
    border-color: var(--ink);
    color: var(--ink);
  }
`

export function PostForm({
  initialValues,
  status,
  errorMessage,
  onSubmit,
  onCancel,
}: PostFormProps) {
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
      <FormField id="post-title" label="Título" error={errors.title}>
        <Input
          type="text"
          value={values.title}
          placeholder="Ex.: Como estruturar um projeto React"
          disabled={isLoading}
          onChange={(event) => {
            const title = event.target.value
            setValues((current) => ({ ...current, title }))
            setErrors((current) => ({ ...current, title: undefined }))
          }}
        />
      </FormField>
      <FormField
        id="post-content"
        label="Conteúdo"
        error={errors.content}
        hint={`${values.content.length} caracteres`}
      >
        <TextArea
          rows={12}
          value={values.content}
          placeholder="Escreva o post…"
          disabled={isLoading}
          onChange={(event) => {
            const content = event.target.value
            setValues((current) => ({ ...current, content }))
            setErrors((current) => ({ ...current, content: undefined }))
          }}
        />
      </FormField>
      {status === 'error' && errorMessage ? (
        <ErrorBox>
          <StatusMessage tone="error">{errorMessage}</StatusMessage>
        </ErrorBox>
      ) : null}
      <Actions>
        <SubmitButton type="submit" disabled={isLoading}>
          {isLoading ? 'Salvando...' : 'Salvar'}
        </SubmitButton>
        {onCancel ? (
          <CancelButton type="button" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </CancelButton>
        ) : null}
      </Actions>
    </Form>
  )
}
