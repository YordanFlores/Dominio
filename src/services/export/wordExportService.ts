import {
  AlignmentType,
  BorderStyle,
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx'
import type { ParsedInventoryResult } from '../../types/inventory'

const downloadBlob = (blob: Blob, fileName: string) => {
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = fileName
  link.click()
  URL.revokeObjectURL(link.href)
}

const createHeaderRow = (headers: string[]) =>
  new TableRow({
    tableHeader: true,
    children: headers.map(
      (header) =>
        new TableCell({
          width: { size: 20, type: WidthType.PERCENTAGE },
          shading: { fill: '1F2937', color: 'FFFFFF' },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: header, bold: true, color: 'FFFFFF', size: 28 })],
            }),
          ],
        }),
    ),
  })

const createDataRows = (rows: ParsedInventoryResult['rows']) =>
  rows.map(
    (row) =>
      new TableRow({
        children: row.map(
          (cell) =>
            new TableCell({
              width: { size: 20, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  alignment: AlignmentType.LEFT,
                  children: [new TextRun({ text: String(cell), size: 26 })],
                }),
              ],
            }),
        ),
      }),
  )

const formatDateLabel = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  })

export const exportToWord = async (
  data: ParsedInventoryResult,
  documentCreatedDate: string,
): Promise<void> => {
  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [createHeaderRow(data.headers), ...createDataRows(data.rows)],
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: '475569' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: '475569' },
      left: { style: BorderStyle.SINGLE, size: 1, color: '475569' },
      right: { style: BorderStyle.SINGLE, size: 1, color: '475569' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: '94A3B8' },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: '94A3B8' },
    },
  })

  const document = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [new TextRun({ text: '[LOGO EMPRESA]', bold: true, size: 34 })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [new TextRun({ text: 'Reporte de Inventario', bold: true, size: 32 })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [
              new TextRun({
                text: `Fecha de creacion: ${formatDateLabel(documentCreatedDate)}`,
                size: 26,
              }),
            ],
          }),
          table,
        ],
      },
    ],
  })

  const blob = await Packer.toBlob(document)
  const fileName = `inventario-${documentCreatedDate}.docx`
  downloadBlob(blob, fileName)
}
