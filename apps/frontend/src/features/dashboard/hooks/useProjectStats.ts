import { useQuery } from '@tanstack/react-query'

import type { ProjectStats } from '../types'

import { apiClient } from '@/shared/lib/axios'

export function useProjectStats(projectId: string | undefined) {
  return useQuery({
    queryKey: ['projects', projectId, 'stats'],
    queryFn: () =>
      apiClient
        .get<{ data: ProjectStats }>(`/api/v1/projects/${projectId}/stats`)
        .then((r) => r.data.data),
    enabled: projectId !== undefined,
    staleTime: 60_000,
  })
}
