import { Progress } from '@/shared/components/ui/progress'

interface CompletionRateCardProps {
  rate: number
}

function rateTextClass(pct: number): string {
  if (pct >= 70) {
    return 'text-green-600'
  }
  if (pct >= 40) {
    return 'text-amber-600'
  }
  return 'text-red-600'
}

export function CompletionRateCard({ rate }: CompletionRateCardProps) {
  const pct = Math.round(rate * 100)

  return (
    <div className="rounded-lg border bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">Completitud</p>
      <p className={`mt-2 text-3xl font-bold ${rateTextClass(pct)}`}>{pct}%</p>
      <Progress value={pct} className="mt-3 h-2" />
    </div>
  )
}
