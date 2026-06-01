import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { PaginatedResponse } from '@/shared/types/api.types'
import type { CreateProjectData, Project, ProjectFilters, ProjectSummary } from '../types'

import { apiClient } from '@/shared/lib/axios'
import { useToast } from '@/shared/hooks/useToast'

export function useProjects(filters?: ProjectFilters) {
  return useQuery({
    queryKey: ['projects', filters],
    queryFn: () =>
      apiClient
        .get<PaginatedResponse<ProjectSummary>>('/api/v1/projects', { params: filters })
        .then((r) => r.data),
    staleTime: 30_000,
  })
}

export function useProject(projectId: string | undefined) {
  return useQuery({
    queryKey: ['projects', projectId],
    queryFn: () => apiClient.get<Project>(`/api/v1/projects/${projectId}`).then((r) => r.data),
    enabled: projectId !== undefined,
    staleTime: 0,
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: CreateProjectData) =>
      apiClient.post<Project>('/api/v1/projects', data).then((r) => r.data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast({ title: 'Proyecto creado exitosamente' })
    },
    onError: (error: Error) => {
      toast({
        title: 'Error al crear el proyecto',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

export function useArchiveProject() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (projectId: string) =>
      apiClient.delete(`/api/v1/projects/${projectId}`).then(() => undefined),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast({ title: 'Proyecto archivado correctamente' })
    },
    onError: (error: Error) => {
      toast({
        title: 'Error al archivar el proyecto',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}
