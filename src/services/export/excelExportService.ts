import { utils, writeFileXLSX } from 'xlsx'
import type { ParsedInventoryResult } from '../../types/inventory'

const formatDateLabel = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  })

const getFileName = (date: string) => `inventario-${date}.xlsx`

export const exportToExcel = (data: ParsedInventoryResult, documentCreatedDate: string): void => {
  const worksheet = utils.aoa_to_sheet([
    ['Fecha de creacion del documento', formatDateLabel(documentCreatedDate)],
    [],
    data.headers,
    ...data.rows,
  ])

  const columnWidths = data.headers.map((header, index) => {
    const maxCellLength = Math.max(
      header.length,
      ...data.rows.map((row) => String(row[index] ?? '').length),
    )
    return { wch: Math.max(16, maxCellLength + 4) }
  })

  worksheet['!cols'] = columnWidths

  for (let columnIndex = 0; columnIndex < data.headers.length; columnIndex += 1) {
    const cellAddress = utils.encode_cell({ c: columnIndex, r: 2 })
    const cell = worksheet[cellAddress]
    if (!cell) {
      continue
    }
    cell.s = {
      fill: { fgColor: { rgb: '1F2937' } },
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      alignment: { horizontal: 'center', vertical: 'center' },
    }
  }

  const workbook = utils.book_new()
  utils.book_append_sheet(workbook, worksheet, 'Inventario')
  writeFileXLSX(workbook, getFileName(documentCreatedDate), { compression: true })
}
