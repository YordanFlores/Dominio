export interface ParsedInventoryResult {
  headers: string[]
  rows: Array<Array<string | number>>
}

export interface InventoryState {
  headers: string[]
  rows: Array<Array<string | number>>
  inputText: string
  lastActionMessage: string
  documentCreatedDate: string
  setInputText: (text: string) => void
  setDocumentCreatedDate: (date: string) => void
  addRows: (payload: ParsedInventoryResult) => void
  updateCell: (rowIndex: number, columnIndex: number, value: string | number) => void
  removeRow: (rowIndex: number) => void
  clearAll: () => void
  setLastActionMessage: (message: string) => void
}
