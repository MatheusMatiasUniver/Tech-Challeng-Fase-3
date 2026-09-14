export const DEFAULT_EXCERPT_LENGTH = 130

export function createExcerpt(content: string, maxLength: number = DEFAULT_EXCERPT_LENGTH): string {
  const firstParagraph = content.trim().split('\n')[0]
  const normalized = firstParagraph.trim().replace(/\s+/g, ' ')

  if (normalized.length <= maxLength) {
    return normalized
  }

  const truncated = normalized.slice(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  const cut = lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated

  return `${cut}…`
}
