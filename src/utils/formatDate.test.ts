import { expect, test } from 'vitest'
import { formatDate } from './formatDate'

test('formata como "dia mes-abreviado ano", sem zero a esquerda', () => {
  expect(formatDate(new Date(2026, 7, 2).toISOString())).toBe('2 ago 2026')
})

test('usa as abreviacoes em portugues para todos os meses', () => {
  const months = Array.from({ length: 12 }, (_, month) =>
    formatDate(new Date(2026, month, 15).toISOString()).split(' ')[1],
  )

  expect(months).toEqual(['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'])
})
