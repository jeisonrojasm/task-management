import { useState } from 'react'
import { Archive } from 'lucide-react'
import { Link } from 'react-router-dom'

import { ProjectStatusBadge } from './ProjectStatusBadge'

import type { ProjectSummary } from '../types'

import { Button } from '@/shared/components/ui/button'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'

interface ProjectCardProps {
  project: ProjectSummary
  onArchive: (id: string) => void
}

export function ProjectCard({ project, onArchive }: ProjectCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)

  const createdAt = new Date(project.createdAt).toLocaleDateString('es', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className="rounded-lg border bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Link
            to={`/projects/${project.id}`}
            className="block truncate font-semibold text-slate-900 hover:text-slate-600"
          >
            {project.name}
          </Link>
          {project.description !== null && (
            <p className="mt-1 line-clamp-2 text-sm text-slate-500">{project.description}</p>
          )}
        </div>
        <ProjectStatusBadge status={project.status} />
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
        <span>{project.taskCount} tareas</span>
        <span>Creado {createdAt}</span>
      </div>
      <div className="mt-3 flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setConfirmOpen(true)}
          className="text-slate-500 hover:text-red-600"
        >
          <Archive className="mr-1 h-4 w-4" />
          Archivar
        </Button>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="¿Archivar proyecto?"
        description="El proyecto quedará archivado y no aparecerá en la lista de proyectos activos."
        onConfirm={() => {
          onArchive(project.id)
          setConfirmOpen(false)
        }}
      />
    </div>
  )
}
