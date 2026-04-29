import { Download, FileSpreadsheet, FileText, Sparkles, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { InventoryTable } from './components/InventoryTable'
import { VoiceRecorder } from './components/VoiceRecorder'
import { AccessibleButton } from './components/ui/AccessibleButton'
import { Panel } from './components/ui/Panel'
import { StatusMessage } from './components/ui/StatusMessage'
import { useSpeechToText } from './hooks/useSpeechToText'
import { exportToExcel } from './services/export/excelExportService'
import { exportToWord } from './services/export/wordExportService'
import { playSuccessTone, speakFeedback } from './services/feedbackService'
import { processInventoryCommand } from './services/inventoryProcessor'
import { useInventoryStore } from './store/inventoryStore'

function App() {
  const {
    headers,
    rows,
    inputText,
    lastActionMessage,
    documentCreatedDate,
    setInputText,
    setDocumentCreatedDate,
    addRows,
    updateCell,
    removeRow,
    clearAll,
    setLastActionMessage,
  } = useInventoryStore()
  const [isExportingWord, setIsExportingWord] = useState(false)
  const [statusTone, setStatusTone] = useState<'success' | 'warning'>('success')
  const [speechCaptured, setSpeechCaptured] = useState('')
  const { transcript, isListening, isSupported, error, startListening, stopListening, resetTranscript } =
    useSpeechToText({ language: 'es-ES' })

  useEffect(() => {
    if (transcript) {
      setSpeechCaptured(transcript)
      setInputText(transcript)
    }
  }, [transcript, setInputText])

  const tableData = useMemo(() => ({ headers, rows }), [headers, rows])
  const safeDocumentDate = documentCreatedDate || new Date().toISOString().slice(0, 10)

  const notifySuccess = (message: string, options?: { withSpeech?: boolean }) => {
    setStatusTone('success')
    setLastActionMessage(message)
    playSuccessTone()
    if (options?.withSpeech ?? true) {
      speakFeedback(message)
    }
  }

  const notifyWarning = (message: string) => {
    setStatusTone('warning')
    setLastActionMessage(message)
  }

  const handleStartDictation = async () => {
    resetTranscript()
    setSpeechCaptured('')
    const started = await startListening()
    if (started) {
      notifySuccess('Dictado iniciado. Puede hablar ahora.', { withSpeech: false })
    }
  }

  const handleStopDictation = () => {
    stopListening()
    notifySuccess('Dictado finalizado.')
  }

  const handleProcessCommand = () => {
    const parsed = processInventoryCommand(inputText)

    if (parsed.rows.length === 0) {
      notifyWarning('No se detectaron productos validos en el comando.')
      return
    }

    addRows(parsed)
    notifySuccess(`${parsed.rows.length} fila(s) agregadas al inventario.`)
  }

  const handleExportExcel = () => {
    if (rows.length === 0) {
      notifyWarning('Agregue al menos una fila para exportar a Excel.')
      return
    }

    exportToExcel(tableData, safeDocumentDate)
    notifySuccess('Archivo Excel generado correctamente.')
  }

  const handleExportWord = async () => {
    if (rows.length === 0) {
      notifyWarning('Agregue al menos una fila para exportar a Word.')
      return
    }

    setIsExportingWord(true)
    try {
      await exportToWord(tableData, safeDocumentDate)
      notifySuccess('Documento Word generado correctamente.')
    } finally {
      setIsExportingWord(false)
    }
  }

  const handleClear = () => {
    clearAll()
    setSpeechCaptured('')
    resetTranscript()
    notifySuccess('Inventario limpiado correctamente.')
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-6 text-white md:px-8 md:py-8">
      <Panel
        title="Dominio Almacen PWA"
        description="Dicta, corrige y exporta su inventario en segundos."
      >
        <StatusMessage message={error ?? lastActionMessage} tone={error ? 'warning' : statusTone} />
      </Panel>

      <Panel
        title="1) Dictado de voz"
        description="Use comandos como: agrega producto tornillos cantidad 25 ubicacion A1 precio 8.5 nota caja azul"
      >
        <VoiceRecorder
          isListening={isListening}
          isSupported={isSupported}
          transcript={speechCaptured}
          onStart={handleStartDictation}
          onStop={handleStopDictation}
        />
      </Panel>

      <Panel
        title="2) Comando IA (simulado)"
        description="Puede escribir o editar el texto dictado para generar filas estructuradas."
      >
        <textarea
          className="focus-ring min-h-[160px] w-full rounded-xl border-2 border-slate-500 bg-slate-900 p-4 text-[20px] text-white"
          value={inputText}
          onChange={(event) => setInputText(event.target.value)}
          placeholder="Ejemplo: agrega producto baterias AA cantidad 40 ubicacion C2 precio 2.4"
        />

        <div className="grid gap-4 md:grid-cols-2">
          <AccessibleButton variant="primary" fullWidth onClick={handleProcessCommand}>
            <Sparkles className="h-6 w-6" aria-hidden="true" />
            Procesar comando
          </AccessibleButton>
          <AccessibleButton variant="danger" fullWidth onClick={handleClear}>
            <Trash2 className="h-6 w-6" aria-hidden="true" />
            Limpiar inventario
          </AccessibleButton>
        </div>
      </Panel>

      <Panel title="3) Tabla de inventario" description="Edite celdas manualmente antes de exportar.">
        <InventoryTable
          data={tableData}
          onUpdateCell={updateCell}
          onRemoveRow={removeRow}
        />
      </Panel>

      <Panel
        title="4) Fecha de creacion del documento"
        description="Seleccione la fecha que desea imprimir en los archivos exportados."
      >
        <label className="flex flex-col gap-3 text-[20px] font-semibold text-slate-100">
          Fecha del documento
          <input
            type="date"
            className="focus-ring h-[60px] rounded-xl border-2 border-slate-500 bg-slate-900 px-4 text-[20px] text-white"
            value={documentCreatedDate}
            onChange={(event) => setDocumentCreatedDate(event.target.value)}
            onBlur={(event) =>
              setDocumentCreatedDate(event.target.value || new Date().toISOString().slice(0, 10))
            }
          />
        </label>
      </Panel>

      <Panel title="5) Exportacion de documentos" description="Genere reportes compatibles con Excel y Word.">
        <div className="grid gap-4 lg:grid-cols-2">
          <AccessibleButton variant="secondary" fullWidth onClick={handleExportExcel}>
            <FileSpreadsheet className="h-6 w-6" aria-hidden="true" />
            Exportar a Excel
            <Download className="h-6 w-6" aria-hidden="true" />
          </AccessibleButton>
          <AccessibleButton
            variant="secondary"
            fullWidth
            onClick={() => void handleExportWord()}
            loading={isExportingWord}
          >
            <FileText className="h-6 w-6" aria-hidden="true" />
            Exportar a Word
            <Download className="h-6 w-6" aria-hidden="true" />
          </AccessibleButton>
        </div>
      </Panel>
    </main>
  )
}

export default App
