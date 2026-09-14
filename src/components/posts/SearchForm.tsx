import { useState, type FormEvent } from 'react'
import styled from 'styled-components'

export interface SearchFormProps {
  value?: string
  onSearch: (term: string) => void
  onClear: () => void
}

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
`

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

const focusRing = `
  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
`

const Input = styled.input`
  flex: 1 1 160px;
  min-width: 0;
  font: inherit;
  font-size: 16px;
  padding: 12px 14px;
  background: var(--surface);
  color: var(--text-h);
  border: 1px solid var(--border-strong);
  border-radius: 10px;

  &:focus {
    outline: 2px solid var(--accent);
    outline-offset: 1px;
    border-color: var(--accent);
  }
`

const PrimaryButton = styled.button`
  border: 0;
  border-radius: 10px;
  padding: 12px 20px;
  font: inherit;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  background: var(--ink);
  color: var(--on-ink);

  &:hover {
    background: var(--accent);
  }
  ${focusRing}
`

const SecondaryButton = styled.button`
  border: 1px solid var(--border-strong);
  border-radius: 10px;
  padding: 12px 18px;
  font: inherit;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  background: none;
  color: var(--text);

  &:hover {
    border-color: var(--ink);
    color: var(--ink);
  }
  ${focusRing}
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
      <Label htmlFor="search-term">Termo de busca</Label>
      <Row>
        <Input
          id="search-term"
          type="search"
          value={term}
          placeholder="Título, autor ou trecho"
          onChange={(event) => setTerm(event.target.value)}
        />
        <PrimaryButton type="submit">Buscar</PrimaryButton>
        <SecondaryButton type="button" onClick={handleClear}>
          Limpar
        </SecondaryButton>
      </Row>
    </Form>
  )
}
