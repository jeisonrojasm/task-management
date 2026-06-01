import { AlertTriangle } from 'lucide-react'

interface OverdueAlertProps {
  overdueCount: number
}

export function OverdueAlert({ overdueCount }: OverdueAlertProps) {
  if (overdueCount === 0) {
    return null
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
      <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
      <p className="text-sm font-medium text-amber-800">
        {overdueCount} {overdueCount === 1 ? 'tarea vencida' : 'tareas vencidas'}
      </p>
    </div>
  )
}
