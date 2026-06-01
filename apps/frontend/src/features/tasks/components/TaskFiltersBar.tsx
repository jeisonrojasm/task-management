import type { TaskStatus, Priority } from '../types'

import { Button } from '@/shared/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'TODO', label: 'Pendiente' },
  { value: 'IN_PROGRESS', label: 'En progreso' },
  { value: 'IN_REVIEW', label: 'En revisión' },
  { value: 'DONE', label: 'Completada' },
  { value: 'CANCELLED', label: 'Cancelada' },
]

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 'LOW', label: 'Baja' },
  { value: 'MEDIUM', label: 'Media' },
  { value: 'HIGH', label: 'Alta' },
  { value: 'CRITICAL', label: 'Crítica' },
]

interface TaskFiltersBarProps {
  status: TaskStatus | undefined
  priority: Priority | undefined
  onStatusChange: (status: TaskStatus | undefined) => void
  onPriorityChange: (priority: Priority | undefined) => void
  onClear: () => void
}

export function TaskFiltersBar({
  status,
  priority,
  onStatusChange,
  onPriorityChange,
  onClear,
}: TaskFiltersBarProps) {
  const hasActiveFilters = status !== undefined || priority !== undefined

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={status ?? 'all'}
        onValueChange={(val) => {
          if (val === 'all') {
            onStatusChange(undefined)
          } else {
            const option = STATUS_OPTIONS.find((o) => o.value === val)
            if (option !== undefined) {
              onStatusChange(option.value)
            }
          }
        }}
      >
        <SelectTrigger className="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los estados</SelectItem>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={priority ?? 'all'}
        onValueChange={(val) => {
          if (val === 'all') {
            onPriorityChange(undefined)
          } else {
            const option = PRIORITY_OPTIONS.find((o) => o.value === val)
            if (option !== undefined) {
              onPriorityChange(option.value)
            }
          }
        }}
      >
        <SelectTrigger className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las prioridades</SelectItem>
          {PRIORITY_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClear} className="text-slate-500">
          Limpiar filtros
        </Button>
      )}
    </div>
  )
}
