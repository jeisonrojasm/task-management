import type { TaskStatus } from '../types'

import { Badge } from '@/shared/components/ui/badge'

interface TaskStatusBadgeProps {
  status: TaskStatus
}

const STATUS_CONFIG: Record<TaskStatus, { label: string; className: string }> = {
  TODO: {
    label: 'Pendiente',
    className: 'border-slate-200 bg-slate-100 text-slate-700',
  },
  IN_PROGRESS: {
    label: 'En progreso',
    className: 'border-blue-200 bg-blue-100 text-blue-700',
  },
  IN_REVIEW: {
    label: 'En revisión',
    className: 'border-amber-200 bg-amber-100 text-amber-700',
  },
  DONE: {
    label: 'Completada',
    className: 'border-green-200 bg-green-100 text-green-700',
  },
  CANCELLED: {
    label: 'Cancelada',
    className: 'border-red-200 bg-red-100 text-red-500 line-through',
  },
}

export function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  return <Badge className={config.className}>{config.label}</Badge>
}
