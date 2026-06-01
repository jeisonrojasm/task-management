import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { PaginatedResponse } from '@/shared/types/api.types'
import type { Task, CreateTaskData, TaskFilters, TaskStatus } from '../types'

import { apiClient } from '@/shared/lib/axios'
import { useToast } from '@/shared/hooks/useToast'

export function useProjectTasks(projectId: string | undefined, filters?: TaskFilters) {
  return useQuery({
    queryKey: ['projects', projectId, 'tasks', filters],
    queryFn: () =>
      apiClient
        .get<PaginatedResponse<Task>>(`/api/v1/projects/${projectId}/tasks`, { params: filters })
        .then((r) => r.data),
    enabled: projectId !== undefined,
    staleTime: 30_000,
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (data: CreateTaskData) =>
      apiClient
        .post<Task>('/api/v1/tasks', {
          project_id: data.projectId,
          title: data.title,
          ...(data.description !== undefined ? { description: data.description } : {}),
          ...(data.priority !== undefined ? { priority: data.priority } : {}),
          ...(data.dueDate !== undefined ? { due_date: data.dueDate } : {}),
        })
        .then((r) => r.data),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ['projects', variables.projectId, 'tasks'],
      })
      await queryClient.invalidateQueries({
        queryKey: ['projects', variables.projectId, 'stats'],
      })
      toast({ title: 'Tarea creada exitosamente' })
    },
    onError: (error: Error) => {
      toast({
        title: 'Error al crear la tarea',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

interface UpdateTaskStatusVars {
  taskId: string
  newStatus: TaskStatus
  projectId: string
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ taskId, newStatus }: UpdateTaskStatusVars) =>
      apiClient
        .patch<Task>(`/api/v1/tasks/${taskId}/status`, { status: newStatus })
        .then((r) => r.data),
    onMutate: async ({ taskId, newStatus, projectId }: UpdateTaskStatusVars) => {
      await queryClient.cancelQueries({ queryKey: ['projects', projectId, 'tasks'] })

      const snapshot = queryClient.getQueriesData<PaginatedResponse<Task>>({
        queryKey: ['projects', projectId, 'tasks'],
      })

      queryClient.setQueriesData<PaginatedResponse<Task>>(
        { queryKey: ['projects', projectId, 'tasks'] },
        (old) => {
          if (old === undefined) {
            return old
          }
          return {
            ...old,
            data: old.data.map((task) =>
              task.id === taskId
                ? {
                    ...task,
                    status: newStatus,
                    isOverdue:
                      newStatus === 'DONE' || newStatus === 'CANCELLED' ? false : task.isOverdue,
                  }
                : task,
            ),
          }
        },
      )

      return { snapshot, projectId }
    },
    onError: (error: Error, _variables, context) => {
      if (context !== undefined) {
        for (const [key, data] of context.snapshot) {
          queryClient.setQueryData(key, data)
        }
      }
      toast({
        title: 'Error al cambiar el estado',
        description: error.message,
        variant: 'destructive',
      })
    },
    onSettled: (_data, _error, { projectId }: UpdateTaskStatusVars) => {
      void queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'tasks'] })
    },
  })
}

interface DeleteTaskVars {
  taskId: string
  projectId: string
}

export function useDeleteTask() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ taskId }: DeleteTaskVars) =>
      apiClient.delete(`/api/v1/tasks/${taskId}`).then(() => undefined),
    onSuccess: async (_data, { projectId }: DeleteTaskVars) => {
      await queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'tasks'] })
      await queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'stats'] })
      toast({ title: 'Tarea eliminada correctamente' })
    },
    onError: (error: Error) => {
      toast({
        title: 'Error al eliminar la tarea',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}
