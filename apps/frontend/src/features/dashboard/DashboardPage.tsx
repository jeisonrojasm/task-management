import { useNavigate, Link } from 'react-router-dom'
import { ListChecks } from 'lucide-react'

import { StatsCard } from './components/StatsCard'

import { useProjects } from '@/features/projects/api/projects.api'
import { EmptyState } from '@/shared/components/EmptyState'
import { LoadingSkeleton } from '@/shared/components/LoadingSkeleton'
import { PageError } from '@/shared/components/PageError'

export function DashboardPage() {
  const navigate = useNavigate()
  const { data, isLoading, isError, refetch } = useProjects({ status: 'ACTIVE' })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <LoadingSkeleton lines={4} />
          <LoadingSkeleton lines={4} />
          <LoadingSkeleton lines={4} />
        </div>
      </div>
    )
  }

  if (isError) {
    return <PageError message="No se pudo cargar el dashboard." onRetry={() => void refetch()} />
  }

  if (data === undefined || data.data.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <EmptyState
          title="Sin proyectos activos"
          description="Crea un proyecto para comenzar a gestionar tus tareas."
          action={{ label: 'Ir a proyectos', onClick: () => navigate('/projects') }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data.data.map((project) => (
          <div key={project.id} className="space-y-4 rounded-lg border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <Link
                to={`/projects/${project.id}`}
                className="min-w-0 flex-1 truncate font-semibold text-slate-900 hover:text-slate-600"
              >
                {project.name}
              </Link>
              <span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                {project.status}
              </span>
            </div>
            <StatsCard title="Total de tareas" value={project.taskCount} icon={ListChecks} />
            <Link
              to={`/projects/${project.id}`}
              className="block text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              Ver detalle completo →
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
