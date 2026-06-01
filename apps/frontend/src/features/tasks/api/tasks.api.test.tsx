import { describe, expect, it } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse, delay } from 'msw'

import { useProjectTasks, useUpdateTaskStatus } from './tasks.api'

import type { Task } from '../types'
import type { PaginatedResponse } from '@/shared/types/api.types'

import { server } from '@/test/server'
import { createQueryWrapper, createTestQueryClient } from '@/test/renderWithProviders'

const projectId = 'project-1'
const filters = { page: 1 }
const tasksKey = ['projects', projectId, 'tasks', filters]

const seedTask: Task = {
  id: 'task-1',
  projectId,
  title: 'Tarea local',
  description: null,
  status: 'TODO',
  priority: 'HIGH',
  dueDate: '2026-03-01',
  isOverdue: false,
  createdAt: '2026-01-11T08:00:00.000Z',
  updatedAt: '2026-01-11T08:00:00.000Z',
}

const seedPage: PaginatedResponse<Task> = {
  data: [seedTask],
  pagination: { page: 1, limit: 20, total: 1, totalPages: 1, hasNext: false, hasPrev: false },
}

function readStatus(queryClient: ReturnType<typeof createTestQueryClient>): string | undefined {
  const cache = queryClient.getQueryData<PaginatedResponse<Task>>(tasksKey)
  return cache?.data[0]?.status
}

describe('useUpdateTaskStatus (optimistic update)', () => {
  it('actualiza el cache optimistamente antes de que la API responda', async () => {
    server.use(
      http.patch('/api/v1/tasks/:taskId/status', async ({ request }) => {
        await delay(50)
        const body = (await request.json()) as { status: string }
        return HttpResponse.json({ ...seedTask, status: body.status })
      }),
    )

    // gcTime Infinity: la query sembrada no tiene observer montado; con gcTime 0
    // se recolectaría antes de poder inspeccionar el cache.
    const queryClient = createTestQueryClient(Infinity)
    queryClient.setQueryData(tasksKey, seedPage)

    const { result } = renderHook(() => useUpdateTaskStatus(), {
      wrapper: createQueryWrapper(queryClient),
    })

    act(() => {
      result.current.mutate({ taskId: 'task-1', newStatus: 'IN_PROGRESS', projectId })
    })

    // Mientras la mutación sigue pendiente, el cache ya refleja el valor optimista.
    await waitFor(() => {
      expect(readStatus(queryClient)).toBe('IN_PROGRESS')
    })
    expect(result.current.isPending).toBe(true)
  })

  it('revierte el cache al estado anterior cuando la API retorna un error', async () => {
    server.use(
      http.patch('/api/v1/tasks/:taskId/status', () => new HttpResponse(null, { status: 500 })),
    )

    // gcTime Infinity: la query sembrada no tiene observer montado; con gcTime 0
    // se recolectaría antes de poder inspeccionar el cache.
    const queryClient = createTestQueryClient(Infinity)
    queryClient.setQueryData(tasksKey, seedPage)

    const { result } = renderHook(() => useUpdateTaskStatus(), {
      wrapper: createQueryWrapper(queryClient),
    })

    act(() => {
      result.current.mutate({ taskId: 'task-1', newStatus: 'IN_PROGRESS', projectId })
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
    // Rollback: vuelve al status original.
    expect(readStatus(queryClient)).toBe('TODO')
  })

  it('el cache queda con el valor del servidor después de la respuesta exitosa', async () => {
    server.use(
      http.patch('/api/v1/tasks/:taskId/status', async ({ request }) => {
        const body = (await request.json()) as { status: string }
        return HttpResponse.json({ ...seedTask, status: body.status })
      }),
      // Tras onSettled → invalidate → refetch, el servidor es la fuente de verdad.
      // El título distinto prueba que el valor proviene del refetch, no del optimismo.
      http.get('/api/v1/projects/:projectId/tasks', () =>
        HttpResponse.json({
          data: [{ ...seedTask, title: 'Tarea canónica del servidor', status: 'IN_PROGRESS' }],
          pagination: seedPage.pagination,
        }),
      ),
    )

    const queryClient = createTestQueryClient()
    const { result } = renderHook(
      () => ({
        list: useProjectTasks(projectId, filters),
        mutation: useUpdateTaskStatus(),
      }),
      { wrapper: createQueryWrapper(queryClient) },
    )

    await waitFor(() => {
      expect(result.current.list.isSuccess).toBe(true)
    })

    act(() => {
      result.current.mutation.mutate({ taskId: 'task-1', newStatus: 'IN_PROGRESS', projectId })
    })

    await waitFor(() => {
      expect(result.current.mutation.isSuccess).toBe(true)
    })

    await waitFor(() => {
      const cache = queryClient.getQueryData<PaginatedResponse<Task>>(tasksKey)
      expect(cache?.data[0]?.title).toBe('Tarea canónica del servidor')
      expect(cache?.data[0]?.status).toBe('IN_PROGRESS')
    })
  })
})
