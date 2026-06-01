import { Skeleton } from '@/shared/components/ui/skeleton'

interface DistributionChartProps {
  distribution: Record<string, number>
  colorMap: Record<string, string>
  loading?: boolean
}

export function DistributionChart({
  distribution,
  colorMap,
  loading = false,
}: DistributionChartProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-1">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-2 w-full" />
          </div>
        ))}
      </div>
    )
  }

  const total = Object.values(distribution).reduce((sum, n) => sum + n, 0)

  if (total === 0) {
    return <p className="text-sm text-slate-400">Sin tareas aún</p>
  }

  return (
    <div className="space-y-2">
      {Object.entries(distribution).map(([key, count]) => {
        const pct = Math.round((count / total) * 100)
        const barColor = colorMap[key] ?? 'bg-slate-300'
        return (
          <div key={key}>
            <div className="mb-1 flex justify-between text-xs text-slate-500">
              <span>{key}</span>
              <span>
                {count} ({pct}%)
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100">
              <div
                className={`h-2 rounded-full transition-all ${barColor}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
