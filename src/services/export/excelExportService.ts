import { read, utils, writeFileXLSX } from 'xlsx'
import type { ParsedInventoryResult } from '../../types/inventory'

const formatDateLabel = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  })

const getFileName = (date: string) => `inventario-${date}.xlsx`

const setCellValue = (
  worksheet: Record<string, unknown>,
  rowIndex: number,
  columnIndex: number,
  value: string | number,
  templateStyle?: unknown,
) => {
  const address = utils.encode_cell({ r: rowIndex, c: columnIndex })
  const cell: Record<string, unknown> = {
    t: typeof value === 'number' ? 'n' : 's',
    v: value,
  }

  if (templateStyle) {
    cell.s = templateStyle
  }

  worksheet[address] = cell
}

const fillTemplateWorksheet = (
  worksheet: Record<string, unknown>,
  data: ParsedInventoryResult,
  documentCreatedDate: string,
) => {
  const headerRow = 2
  const dataStartRow = 3
  const dateLabel = formatDateLabel(documentCreatedDate)
  const range = utils.decode_range(String(worksheet['!ref'] ?? 'A1:E3'))
  const maxColumns = Math.max(range.e.c + 1, data.headers.length)

  setCellValue(worksheet, 0, 0, 'Fecha de creacion del documento')
  setCellValue(worksheet, 0, 1, dateLabel)

  const headerStyles = data.headers.map((_, columnIndex) => {
    const address = utils.encode_cell({ r: headerRow, c: columnIndex })
    const source = worksheet[address] as { s?: unknown } | undefined
    return source?.s
  })

  const dataStyles = data.headers.map((_, columnIndex) => {
    const address = utils.encode_cell({ r: dataStartRow, c: columnIndex })
    const source = worksheet[address] as { s?: unknown } | undefined
    return source?.s
  })

  for (let columnIndex = 0; columnIndex < maxColumns; columnIndex += 1) {
    setCellValue(
      worksheet,
      headerRow,
      columnIndex,
      data.headers[columnIndex] ?? '',
      headerStyles[columnIndex],
    )
  }

  for (let rowIndex = dataStartRow; rowIndex <= range.e.r; rowIndex += 1) {
    for (let columnIndex = 0; columnIndex < maxColumns; columnIndex += 1) {
      const address = utils.encode_cell({ r: rowIndex, c: columnIndex })
      delete worksheet[address]
    }
  }

  data.rows.forEach((row, rowOffset) => {
    row.forEach((cellValue, columnIndex) => {
      setCellValue(
        worksheet,
        dataStartRow + rowOffset,
        columnIndex,
        cellValue,
        dataStyles[columnIndex],
      )
    })
  })

  const finalDataRow = Math.max(dataStartRow, dataStartRow + data.rows.length - 1)
  worksheet['!ref'] = utils.encode_range({
    s: { r: 0, c: 0 },
    e: { r: finalDataRow, c: maxColumns - 1 },
  })

  const columnWidths = data.headers.map((header, index) => {
    const maxCellLength = Math.max(
      header.length,
      ...data.rows.map((row) => String(row[index] ?? '').length),
    )
    return { wch: Math.max(16, maxCellLength + 4) }
  })

  worksheet['!cols'] = columnWidths
}

const buildDefaultWorkbook = (data: ParsedInventoryResult, documentCreatedDate: string) => {
  const workbook = utils.book_new()
  const worksheet = utils.aoa_to_sheet([
    ['Fecha de creacion del documento', formatDateLabel(documentCreatedDate)],
    [],
    data.headers,
    ...data.rows,
  ])

  fillTemplateWorksheet(worksheet as Record<string, unknown>, data, documentCreatedDate)
  utils.book_append_sheet(workbook, worksheet, 'Inventario')
  return workbook
}

export const exportToExcel = async (
  data: ParsedInventoryResult,
  documentCreatedDate: string,
  excelTemplateFile?: File | null,
): Promise<void> => {
  let workbook = buildDefaultWorkbook(data, documentCreatedDate)

  if (excelTemplateFile) {
    const fileBuffer = await excelTemplateFile.arrayBuffer()
    const templateWorkbook = read(fileBuffer, {
      type: 'array',
      cellStyles: true,
      cellNF: true,
      cellDates: true,
    })
    const sheetName = templateWorkbook.SheetNames[0]
    if (!sheetName) {
      writeFileXLSX(workbook, getFileName(documentCreatedDate), {
        compression: true,
        cellStyles: true,
      })
      return
    }

    const worksheet = templateWorkbook.Sheets[sheetName]
    if (worksheet) {
      fillTemplateWorksheet(worksheet as Record<string, unknown>, data, documentCreatedDate)
      workbook = templateWorkbook
    }
  }

  writeFileXLSX(workbook, getFileName(documentCreatedDate), {
    compression: true,
    cellStyles: true,
  })
}
