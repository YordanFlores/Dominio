import { CircleCheckBig, TriangleAlert } from 'lucide-react'

interface StatusMessageProps {
  message: string
  tone?: 'success' | 'warning'
}

export const StatusMessage = ({ message, tone = 'success' }: StatusMessageProps) => {
  const isSuccess = tone === 'success'
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border-2 p-4 text-[20px] font-semibold ${isSuccess ? 'border-positive/70 bg-positive/15 text-green-100' : 'border-yellow-300/70 bg-yellow-500/15 text-yellow-100'}`}
      role="status"
      aria-live="polite"
    >
      {isSuccess ? (
        <CircleCheckBig className="h-7 w-7 shrink-0" aria-hidden="true" />
      ) : (
        <TriangleAlert className="h-7 w-7 shrink-0" aria-hidden="true" />
      )}
      <span>{message}</span>
    </div>
  )
}
