import { Trash2 } from 'lucide-react'
import type { ParsedInventoryResult } from '../types/inventory'
import { AccessibleButton } from './ui/AccessibleButton'

interface InventoryTableProps {
  data: ParsedInventoryResult
  onUpdateCell: (rowIndex: number, columnIndex: number, value: string) => void
  onRemoveRow: (rowIndex: number) => void
}

export const InventoryTable = ({ data, onUpdateCell, onRemoveRow }: InventoryTableProps) => {
  if (data.rows.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-slate-500 p-6 text-[20px] text-slate-200">
        Todavia no hay filas cargadas. Use dictado o escriba un comando para comenzar.
      </div>
    )
  }

  return (
    <div className="overflow-auto rounded-xl border-2 border-slate-500">
      <table className="min-w-full border-collapse text-left">
        <thead className="bg-slate-700">
          <tr>
            {data.headers.map((header) => (
              <th key={header} className="border border-slate-500 px-4 py-4 text-[20px] font-bold text-white">
                {header}
              </th>
            ))}
            <th className="border border-slate-500 px-4 py-4 text-[20px] font-bold text-white">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-slate-900">
          {data.rows.map((row, rowIndex) => (
            <tr key={`row-${rowIndex}`}>
              {row.map((cell, columnIndex) => (
                <td key={`${rowIndex}-${columnIndex}`} className="border border-slate-500 p-2">
                  <input
                    className="focus-ring h-[60px] w-full rounded-lg border-2 border-slate-500 bg-slate-950 px-3 text-[20px] text-white"
                    value={String(cell)}
                    onChange={(event) => onUpdateCell(rowIndex, columnIndex, event.target.value)}
                  />
                </td>
              ))}
              <td className="border border-slate-500 p-2">
                <AccessibleButton variant="danger" onClick={() => onRemoveRow(rowIndex)} aria-label="Eliminar fila">
                  <Trash2 className="h-6 w-6" aria-hidden="true" />
                  Eliminar
                </AccessibleButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
