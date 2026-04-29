import type { ParsedInventoryResult } from '../types/inventory'

const headers = ['Producto', 'Cantidad', 'Ubicacion', 'Precio', 'Notas']

const normalizeNumber = (value: string | undefined): number => {
  if (!value) {
    return 0
  }

  return Number.parseFloat(value.replace(',', '.')) || 0
}

const normalizeText = (value: string | undefined): string => (value ?? '').trim()

const commandRegex =
  /(?:agrega|anade|añade|registra|crear?)\s+(?:producto\s+)?(?<product>[\w\s.-]+?)\s+(?:cantidad|cant)\s+(?<quantity>\d+)(?:\s+(?:ubicacion|ubicación|estante)\s+(?<location>[\w-]+))?(?:\s+(?:precio|costo)\s+(?<price>\d+(?:[.,]\d+)?))?(?:\s+(?:nota|notas?)\s+(?<note>[^.;\n]+))?/gim

const csvLikeRegex =
  /producto\s*[:=]\s*(?<product>[^,;\n]+)\s*[,;]\s*cantidad\s*[:=]\s*(?<quantity>\d+)(?:\s*[,;]\s*ubicacion\s*[:=]\s*(?<location>[^,;\n]+))?(?:\s*[,;]\s*precio\s*[:=]\s*(?<price>\d+(?:[.,]\d+)?))?(?:\s*[,;]\s*nota\s*[:=]\s*(?<note>[^,;\n]+))?/gim

const mapMatchToRow = (groups: Record<string, string | undefined>) => [
  normalizeText(groups.product),
  normalizeNumber(groups.quantity),
  normalizeText(groups.location) || 'Sin ubicacion',
  normalizeNumber(groups.price),
  normalizeText(groups.note),
]

const fallbackRowFromSentence = (text: string) => {
  const words = text.split(/\s+/).filter(Boolean)
  const quantityCandidate = words.find((word) => /^\d+$/.test(word))
  const quantity = quantityCandidate ? Number.parseInt(quantityCandidate, 10) : 1
  const product = words
    .filter((word) => !/^\d+$/.test(word))
    .slice(0, 4)
    .join(' ')

  return [product || 'Item sin nombre', quantity, 'Sin ubicacion', 0, text.trim()]
}

export const processInventoryCommand = (text: string): ParsedInventoryResult => {
  const cleanText = text.trim()
  if (!cleanText) {
    return { headers, rows: [] }
  }

  const rows: ParsedInventoryResult['rows'] = []

  for (const match of cleanText.matchAll(commandRegex)) {
    if (!match.groups) {
      continue
    }
    rows.push(mapMatchToRow(match.groups))
  }

  if (rows.length === 0) {
    for (const match of cleanText.matchAll(csvLikeRegex)) {
      if (!match.groups) {
        continue
      }
      rows.push(mapMatchToRow(match.groups))
    }
  }

  if (rows.length === 0) {
    const chunks = cleanText.split(/[.;\n]/).map((part) => part.trim()).filter(Boolean)
    rows.push(...chunks.map((sentence) => fallbackRowFromSentence(sentence)))
  }

  return {
    headers,
    rows,
  }
}
