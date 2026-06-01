import { AlertTriangle, CheckCircle2, Sparkles } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'

import { useProjectStats } from '../hooks/useProjectStats'

import { Skeleton } from '@/shared/components/ui/skeleton'

interface AIInsightsPanelProps {
  projectId: string
}

function formatTimeAgo(iso: string): string {
  const diffMinutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000)
  if (diffMinutes < 1) {
    return 'hace un momento'
  }
  if (diffMinutes === 1) {
    return 'hace 1 minuto'
  }
  return `hace ${diffMinutes} minutos`
}

export function AIInsightsPanel({ projectId }: AIInsightsPanelProps) {
  const queryClient = useQueryClient()
  const { data, isLoading, isFetching, isError, refetch } = useProjectStats(projectId)

  if (isLoading || isFetching) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
        <p className="pt-1 text-xs text-slate-400">Generando análisis...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <p className="text-sm text-slate-600">
            Los análisis de IA no están disponibles temporalmente
          </p>
        </div>
        <button
          onClick={() => void refetch()}
          className="rounded-md border px-3 py-1.5 text-sm hover:bg-slate-50"
        >
          Intentar de nuevo
        </button>
      </div>
    )
  }

  if (data === undefined || data.aiInsights === null) {
    return <p className="text-sm text-slate-400">Análisis aún no disponibles para este proyecto</p>
  }

  const { aiInsights } = data

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-500" />
          <h3 className="font-semibold text-slate-800">Análisis de IA</h3>
        </div>
        <button
          onClick={() =>
            void queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'stats'] })
          }
          className="rounded-md border px-3 py-1.5 text-sm hover:bg-slate-50"
        >
          Regenerar
        </button>
      </div>

      <p className="text-sm text-slate-600">{aiInsights.summary}</p>

      <ul className="space-y-2">
        {aiInsights.recommendations.map((rec, i) => (
          <li key={i} className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
            <span className="text-sm text-slate-600">{rec}</span>
          </li>
        ))}
      </ul>

      <p className="text-xs text-slate-400">Generado {formatTimeAgo(aiInsights.generatedAt)}</p>
    </div>
  )
}
