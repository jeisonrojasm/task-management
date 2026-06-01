import { AlertCircle } from 'lucide-react'

interface PageErrorProps {
  message?: string
  onRetry?: () => void
}

export function PageError({ message = 'Something went wrong.', onRetry }: PageErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
      <AlertCircle className="h-10 w-10 text-red-500" />
      <p className="text-slate-600">{message}</p>
      {onRetry !== undefined && (
        <button
          onClick={onRetry}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700"
        >
          Intentar de nuevo
        </button>
      )}
    </div>
  )
}
