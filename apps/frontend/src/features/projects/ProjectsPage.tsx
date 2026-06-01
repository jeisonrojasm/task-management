import { useState } from 'react'

import { useProjectFilters } from './hooks/useProjectFilters'
import { CreateProjectDialog } from './components/CreateProjectDialog'
import { ProjectList } from './components/ProjectList'

import { Button } from '@/shared/components/ui/button'

export function ProjectsPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const { status, setStatus, page, setPage } = useProjectFilters()

  function handleStatusChange(newStatus: 'ACTIVE' | 'ARCHIVED') {
    setStatus(newStatus)
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Proyectos</h1>
        <Button onClick={() => setCreateOpen(true)}>Nuevo proyecto</Button>
      </div>
      <div className="flex gap-2">
        <Button
          variant={status === 'ACTIVE' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleStatusChange('ACTIVE')}
        >
          Activos
        </Button>
        <Button
          variant={status === 'ARCHIVED' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleStatusChange('ARCHIVED')}
        >
          Archivados
        </Button>
      </div>
      <ProjectList
        filters={{ status, page }}
        onCreateProject={() => setCreateOpen(true)}
        onPageChange={(p) => setPage(p)}
      />
      <CreateProjectDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
