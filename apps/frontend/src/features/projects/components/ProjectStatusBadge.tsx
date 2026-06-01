import type { Project } from '../types'

import { Badge } from '@/shared/components/ui/badge'

interface ProjectStatusBadgeProps {
  status: Project['status']
}

export function ProjectStatusBadge({ status }: ProjectStatusBadgeProps) {
  if (status === 'ACTIVE') {
    return <Badge className="border-green-200 bg-green-100 text-green-800">Activo</Badge>
  }
  return <Badge className="border-slate-200 bg-slate-100 text-slate-600">Archivado</Badge>
}
