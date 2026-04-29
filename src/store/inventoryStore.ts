import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { InventoryState, ParsedInventoryResult } from '../types/inventory'

const defaultHeaders = ['Producto', 'Cantidad', 'Ubicacion', 'Precio', 'Notas']
const todayDate = new Date().toISOString().slice(0, 10)

const normalizeRows = (rows: ParsedInventoryResult['rows'], totalColumns: number) =>
  rows.map((row) => {
    const normalized = [...row].slice(0, totalColumns)

    while (normalized.length < totalColumns) {
      normalized.push('')
    }

    return normalized
  })

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set) => ({
      headers: defaultHeaders,
      rows: [],
      inputText: '',
      lastActionMessage: 'Listo para dictado de inventario.',
      documentCreatedDate: todayDate,
      setInputText: (text) => set({ inputText: text }),
      setDocumentCreatedDate: (date) => set({ documentCreatedDate: date }),
      addRows: (payload) =>
        set((state) => {
          const headers = payload.headers.length > 0 ? payload.headers : state.headers
          const rows = normalizeRows(payload.rows, headers.length)

          return {
            headers,
            rows: [...state.rows, ...rows],
          }
        }),
      updateCell: (rowIndex, columnIndex, value) =>
        set((state) => {
          const nextRows = [...state.rows]
          const targetRow = [...(nextRows[rowIndex] ?? [])]
          targetRow[columnIndex] = value
          nextRows[rowIndex] = targetRow

          return { rows: nextRows }
        }),
      removeRow: (rowIndex) =>
        set((state) => ({
          rows: state.rows.filter((_, index) => index !== rowIndex),
        })),
      clearAll: () =>
        set({
          rows: [],
          inputText: '',
          lastActionMessage: 'Inventario limpiado correctamente.',
        }),
      setLastActionMessage: (message) => set({ lastActionMessage: message }),
    }),
    {
      name: 'dominio-inventory-storage',
      partialize: (state) => ({
        headers: state.headers,
        rows: state.rows,
        inputText: state.inputText,
        lastActionMessage: state.lastActionMessage,
        documentCreatedDate: state.documentCreatedDate,
      }),
    },
  ),
)
