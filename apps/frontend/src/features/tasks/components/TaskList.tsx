import { useProjectTasks, useUpdateTaskStatus, useDeleteTask } from '../api/tasks.api'

import { TaskCard } from './TaskCard'

import type { TaskFilters, TaskStatus } from '../types'

import { EmptyState } from '@/shared/components/EmptyState'
import { LoadingSkeleton } from '@/shared/components/LoadingSkeleton'
import { PageError } from '@/shared/components/PageError'

interface TaskListProps {
  projectId: string
  filters: TaskFilters
  onPageChange: (page: number) => void
}

export function TaskList({ projectId, filters, onPageChange }: TaskListProps) {
  const { data, isLoading, isError, refetch } = useProjectTasks(projectId, filters)
  const { mutate: updateStatus } = useUpdateTaskStatus()
  const { mutate: deleteTask } = useDeleteTask()

  if (isLoading) {
    return (
      <div className="space-y-3">
        <LoadingSkeleton lines={3} />
        <LoadingSkeleton lines={3} />
        <LoadingSkeleton lines={3} />
      </div>
    )
  }

  if (isError) {
    return <PageError message="No se pudieron cargar las tareas." onRetry={() => void refetch()} />
  }

  if (data === undefined || data.data.length === 0) {
    return (
      <EmptyState
        title="Sin tareas"
        description="Este proyecto no tiene tareas aún. Crea la primera tarea para comenzar."
      />
    )
  }

  const { pagination } = data

  function handleStatusChange(taskId: string, newStatus: TaskStatus) {
    updateStatus({ taskId, newStatus, projectId })
  }

  function handleDelete(taskId: string) {
    deleteTask({ taskId, projectId })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {data.data.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {(pagination.hasPrev || pagination.hasNext) && (
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>
            Página {pagination.page} de {pagination.totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={!pagination.hasPrev}
              className="rounded-md border px-3 py-1 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={!pagination.hasNext}
              className="rounded-md border px-3 py-1 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
