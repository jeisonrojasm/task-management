import type { Priority } from '../types'

import { Badge } from '@/shared/components/ui/badge'

interface TaskPriorityBadgeProps {
  priority: Priority
}

const PRIORITY_CONFIG: Record<Priority, { label: string; className: string }> = {
  LOW: {
    label: 'Baja',
    className: 'border-slate-200 bg-slate-100 text-slate-600',
  },
  MEDIUM: {
    label: 'Media',
    className: 'border-blue-200 bg-blue-100 text-blue-600',
  },
  HIGH: {
    label: 'Alta',
    className: 'border-orange-200 bg-orange-100 text-orange-600',
  },
  CRITICAL: {
    label: 'Crítica',
    className: 'border-red-300 bg-red-100 text-red-600 animate-pulse',
  },
}

export function TaskPriorityBadge({ priority }: TaskPriorityBadgeProps) {
  const config = PRIORITY_CONFIG[priority]
  return <Badge className={config.className}>{config.label}</Badge>
}
