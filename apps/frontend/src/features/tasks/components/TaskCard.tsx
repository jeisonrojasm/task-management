import { useState } from 'react'
import { Trash2, ArrowRightLeft } from 'lucide-react'

import { VALID_TRANSITIONS, type Task, type TaskStatus } from '../types'

import { TaskStatusBadge } from './TaskStatusBadge'
import { TaskPriorityBadge } from './TaskPriorityBadge'

import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'

const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: 'Pendiente',
  IN_PROGRESS: 'En progreso',
  IN_REVIEW: 'En revisión',
  DONE: 'Completada',
  CANCELLED: 'Cancelada',
}

interface TaskCardProps {
  task: Task
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void
  onDelete: (taskId: string) => void
}

export function TaskCard({ task, onStatusChange, onDelete }: TaskCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)

  const transitions = VALID_TRANSITIONS[task.status]
  const hasTransitions = transitions.length > 0

  const dueDateLabel =
    task.dueDate !== null
      ? new Date(task.dueDate).toLocaleDateString('es', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          timeZone: 'UTC',
        })
      : null

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="truncate font-medium text-slate-900">{task.title}</p>
          {task.description !== null && (
            <p className="line-clamp-2 text-sm text-slate-500">{task.description}</p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {hasTransitions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-slate-500">
                  <ArrowRightLeft className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {transitions.map((status) => (
                  <DropdownMenuItem key={status} onClick={() => onStatusChange(task.id, status)}>
                    {STATUS_LABELS[status]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-slate-400 hover:text-red-600"
            onClick={() => setConfirmOpen(true)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <TaskStatusBadge status={task.status} />
        <TaskPriorityBadge priority={task.priority} />
        {dueDateLabel !== null && (
          <span
            className={`text-xs ${task.isOverdue ? 'font-medium text-red-600' : 'text-slate-400'}`}
          >
            {task.isOverdue ? '⚠ ' : ''}Vence: {dueDateLabel}
          </span>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="¿Eliminar tarea?"
        description="Esta acción no se puede deshacer. La tarea será eliminada permanentemente."
        onConfirm={() => {
          onDelete(task.id)
          setConfirmOpen(false)
        }}
      />
    </div>
  )
}
