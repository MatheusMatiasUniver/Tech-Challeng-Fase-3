import { expect, test } from 'vitest'
import { createExcerpt } from './createExcerpt'

test('conteudo mais curto que o limite volta sem alteracao e sem reticencias', () => {
  expect(createExcerpt('Um texto curto.')).toBe('Um texto curto.')
})

test('conteudo vazio devolve string vazia', () => {
  expect(createExcerpt('')).toBe('')
})

test('conteudo so com espacos e quebras de linha devolve string vazia', () => {
  expect(createExcerpt('   \n\n   \t  ')).toBe('')
})

test('normaliza espacos e quebras de linha repetidas para um espaco so', () => {
  expect(createExcerpt('Primeira linha.\n\nSegunda   linha.')).toBe(
    'Primeira linha. Segunda linha.',
  )
})

test('conteudo longo corta no ultimo espaco antes do limite e adiciona reticencias', () => {
  const content = 'palavra '.repeat(30).trim()

  const excerpt = createExcerpt(content, 20)

  expect(excerpt.length).toBeLessThanOrEqual(21)
  expect(excerpt.endsWith('…')).toBe(true)
  expect(excerpt).not.toMatch(/ …$/)
})

test('preserva acentuacao (Unicode) ao cortar o texto', () => {
  const content = 'Não é fácil resumir conteúdo com acentuação em português corretamente'

  const excerpt = createExcerpt(content, 30)

  expect(excerpt.endsWith('…')).toBe(true)
  expect(excerpt).toMatch(/[áéíóúãõç]/)
})

test('palavra unica maior que o limite corta no meio, mas ainda adiciona reticencias', () => {
  const content = 'a'.repeat(50)

  const excerpt = createExcerpt(content, 10)

  expect(excerpt).toBe(`${'a'.repeat(10)}…`)
})

test('aceita um limite customizado', () => {
  const content = 'Um dois tres quatro cinco'

  expect(createExcerpt(content, 8)).toBe('Um dois…')
})
