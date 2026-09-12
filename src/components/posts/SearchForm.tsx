import { useState, type FormEvent } from 'react'
import styled from 'styled-components'
import { FormField } from '../forms/FormField'

export interface SearchFormProps {
  value?: string
  onSearch: (term: string) => void
  onClear: () => void
}

const Form = styled.form`
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
  flex-wrap: wrap;
`

const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
`

const Button = styled.button`
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 0.55rem 1rem;
  font: inherit;
  cursor: pointer;
  background: transparent;
  color: var(--text-h);

  &:hover {
    border-color: var(--accent);
    color: var(--accent);
  }
`

export function SearchForm({ value = '', onSearch, onClear }: SearchFormProps) {
  const [term, setTerm] = useState(value)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = term.trim()
    if (!trimmed) {
      return
    }
    onSearch(trimmed)
  }

  function handleClear() {
    setTerm('')
    onClear()
  }

  return (
    <Form onSubmit={handleSubmit} role="search" aria-label="Buscar posts">
      <FormField id="search-term" label="Termo de busca">
        <input type="search" value={term} onChange={(event) => setTerm(event.target.value)} />
      </FormField>
      <Actions>
        <Button type="submit">Buscar</Button>
        <Button type="button" onClick={handleClear}>
          Limpar
        </Button>
      </Actions>
    </Form>
  )
}
