import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AlertTriangle, ListChecks } from 'lucide-react'

import {
  CreateTaskDialog,
  TaskFiltersBar,
  TaskList,
  useTaskFilters,
  type TaskFilters,
} from '../tasks'
import {
  AIInsightsPanel,
  CompletionRateCard,
  DistributionChart,
  OverdueAlert,
  StatsCard,
  useProjectStats,
} from '../dashboard'

import { useArchiveProject, useProject } from './api/projects.api'
import { ProjectStatusBadge } from './components/ProjectStatusBadge'

import { Button } from '@/shared/components/ui/button'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { ErrorBoundary } from '@/shared/components/ErrorBoundary'
import { LoadingSkeleton } from '@/shared/components/LoadingSkeleton'
import { PageError } from '@/shared/components/PageError'

const STATUS_COLOR_MAP: Record<string, string> = {
  TODO: 'bg-slate-400',
  IN_PROGRESS: 'bg-blue-500',
  IN_REVIEW: 'bg-amber-500',
  DONE: 'bg-green-500',
  CANCELLED: 'bg-red-400',
}

const PRIORITY_COLOR_MAP: Record<string, string> = {
  LOW: 'bg-slate-400',
  MEDIUM: 'bg-blue-500',
  HIGH: 'bg-orange-500',
  CRITICAL: 'bg-red-500',
}

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [createTaskOpen, setCreateTaskOpen] = useState(false)

  const { data: project, isLoading, isError, refetch } = useProject(projectId)
  const { mutate: archiveProject, isPending: isArchiving } = useArchiveProject()
  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
    refetch: refetchStats,
  } = useProjectStats(projectId)

  const { status, priority, page, setStatus, setPriority, setPage, reset } = useTaskFilters()
  const filters: TaskFilters = {
    ...(status !== undefined && { status }),
    ...(priority !== undefined && { priority }),
    page,
    limit: 20,
  }

  if (isLoading) {
    return (
      <div className="space-y-4 p-2">
        <LoadingSkeleton lines={3} />
      </div>
    )
  }

  if (isError || project === undefined) {
    return <PageError message="No se pudo cargar el proyecto." onRetry={() => void refetch()} />
  }

  function handleArchive() {
    if (project === undefined) {
      return
    }
    archiveProject(project.id, {
      onSuccess: () => void navigate('/projects'),
    })
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
          {project.description !== null && <p className="text-slate-500">{project.description}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <ProjectStatusBadge status={project.status} />
          <Button variant="outline" size="sm" onClick={() => setConfirmOpen(true)}>
            Archivar
          </Button>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Tareas</h2>
          <Button size="sm" onClick={() => setCreateTaskOpen(true)}>
            Agregar tarea
          </Button>
        </div>

        <TaskFiltersBar
          status={status}
          priority={priority}
          onStatusChange={setStatus}
          onPriorityChange={setPriority}
          onClear={reset}
        />

        {projectId !== undefined && (
          <TaskList projectId={projectId} filters={filters} onPageChange={setPage} />
        )}
      </section>

      <section className="space-y-6">
        <h2 className="text-lg font-semibold text-slate-800">Estadísticas</h2>

        {statsLoading && <LoadingSkeleton lines={3} />}

        {statsError && (
          <PageError
            message="No se pudieron cargar las estadísticas."
            onRetry={() => void refetchStats()}
          />
        )}

        {!statsLoading && !statsError && stats !== undefined && (
          <div className="space-y-6">
            {stats.overdueCount > 0 && <OverdueAlert overdueCount={stats.overdueCount} />}

            <div className="grid gap-4 sm:grid-cols-3">
              <StatsCard title="Total de tareas" value={stats.taskCount} icon={ListChecks} />
              <CompletionRateCard rate={stats.completionRate} />
              <StatsCard
                title="Vencidas"
                value={stats.overdueCount}
                icon={AlertTriangle}
                variant={stats.overdueCount > 0 ? 'warning' : 'default'}
              />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-3 rounded-lg border bg-white p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-600">Por estado</h3>
                <DistributionChart distribution={stats.byStatus} colorMap={STATUS_COLOR_MAP} />
              </div>
              <div className="space-y-3 rounded-lg border bg-white p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-600">Por prioridad</h3>
                <DistributionChart distribution={stats.byPriority} colorMap={PRIORITY_COLOR_MAP} />
              </div>
            </div>
          </div>
        )}

        {!statsError && (
          <div className="rounded-lg border bg-white p-5 shadow-sm">
            <ErrorBoundary
              fallback={<PageError message="No se pudieron cargar los análisis de IA" />}
            >
              <AIInsightsPanel projectId={project.id} />
            </ErrorBoundary>
          </div>
        )}
      </section>

      {projectId !== undefined && (
        <CreateTaskDialog
          projectId={projectId}
          open={createTaskOpen}
          onOpenChange={setCreateTaskOpen}
        />
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="¿Archivar proyecto?"
        description="El proyecto quedará archivado y no aparecerá en la lista de proyectos activos."
        onConfirm={handleArchive}
        loading={isArchiving}
      />
    </div>
  )
}
