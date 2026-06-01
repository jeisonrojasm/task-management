import { useArchiveProject, useProjects } from '../api/projects.api'

import { ProjectCard } from './ProjectCard'

import type { ProjectFilters } from '../types'

import { EmptyState } from '@/shared/components/EmptyState'
import { LoadingSkeleton } from '@/shared/components/LoadingSkeleton'
import { PageError } from '@/shared/components/PageError'

interface ProjectListProps {
  filters: ProjectFilters
  onCreateProject: () => void
  onPageChange: (page: number) => void
}

export function ProjectList({ filters, onCreateProject, onPageChange }: ProjectListProps) {
  const { data, isLoading, isError, refetch } = useProjects(filters)
  const { mutate: archiveProject } = useArchiveProject()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton lines={4} />
        <LoadingSkeleton lines={4} />
        <LoadingSkeleton lines={4} />
      </div>
    )
  }

  if (isError) {
    return (
      <PageError
        message="No se pudo cargar la lista de proyectos."
        onRetry={() => void refetch()}
      />
    )
  }

  if (data === undefined || data.data.length === 0) {
    return (
      <EmptyState
        title="Sin proyectos"
        description="Aún no hay proyectos en esta lista."
        action={{ label: 'Crear proyecto', onClick: onCreateProject }}
      />
    )
  }

  const { pagination } = data

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.data.map((project) => (
          <ProjectCard key={project.id} project={project} onArchive={(id) => archiveProject(id)} />
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
