import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

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

  const { data: project, isLoading, isError, refetch } = useProject(projectId)
  const { mutate: archiveProject, isPending: isArchiving } = useArchiveProject()

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

      <section>
        <p className="text-sm text-slate-400">Tareas — próximamente (SESSION-18)</p>
      </section>

      <section>
        <p className="text-sm text-slate-400">
          Estadísticas e información — próximamente (SESSION-19)
        </p>
      </section>

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
