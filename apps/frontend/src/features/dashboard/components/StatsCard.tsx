import type { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: number | string
  subtitle?: string
  icon?: LucideIcon
  variant?: 'default' | 'warning' | 'success'
}

function valueClass(variant: 'default' | 'warning' | 'success'): string {
  if (variant === 'success') {
    return 'text-green-600'
  }
  if (variant === 'warning') {
    return 'text-amber-600'
  }
  return 'text-slate-900'
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
}: StatsCardProps) {
  return (
    <div className="rounded-lg border bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        {Icon !== undefined && <Icon className="h-5 w-5 text-slate-400" />}
      </div>
      <p className={`mt-2 text-3xl font-bold ${valueClass(variant)}`}>{value}</p>
      {subtitle !== undefined && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
    </div>
  )
}
