import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import {
  CreateTaskDialog,
  TaskFiltersBar,
  TaskList,
  useTaskFilters,
  type TaskFilters,
} from '../tasks'

import { useArchiveProject, useProject } from './api/projects.api'
import { ProjectStatusBadge } from './components/ProjectStatusBadge'

import { Button } from '@/shared/components/ui/button'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { LoadingSkeleton } from '@/shared/components/LoadingSkeleton'
import { PageError } from '@/shared/components/PageError'

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [createTaskOpen, setCreateTaskOpen] = useState(false)

  const { data: project, isLoading, isError, refetch } = useProject(projectId)
  const { mutate: archiveProject, isPending: isArchiving } = useArchiveProject()

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

      <section>
        <p className="text-sm text-slate-400">Estadísticas e información — próximamente</p>
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
