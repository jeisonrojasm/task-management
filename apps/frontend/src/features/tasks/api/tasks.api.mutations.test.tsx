import { type ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { act, renderHook, screen, waitFor } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'

import { useCreateTask, useDeleteTask, useProjectTasks } from './tasks.api'

import { server } from '@/test/server'
import { mockTask, mockTasks } from '@/test/handlers'
import { createTestQueryClient } from '@/test/renderWithProviders'
import { useToast } from '@/shared/hooks/useToast'

// Sonda mínima de toasts (store real), sin Radix.
function ToastProbe() {
  const { toasts } = useToast()
  return (
    <ul>
      {toasts.map((t) => (
        <li key={t.id}>{t.title}</li>
      ))}
    </ul>
  )
}

const projectId = mockTask.project_id
const filters = { page: 1 }

const tasksPagination = {
  page: 1,
  limit: 20,
  total: mockTasks.length,
  total_pages: 1,
  has_next: false,
  has_prev: false,
}

function makeWrapper(queryClient: ReturnType<typeof createTestQueryClient>) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
        <ToastProbe />
      </QueryClientProvider>
    )
  }
}

describe('useCreateTask', () => {
  it('invalida la lista de tareas y muestra un toast de éxito', async () => {
    let getCalls = 0
    server.use(
      http.get('/api/v1/projects/:projectId/tasks', () => {
        getCalls += 1
        return HttpResponse.json({ data: mockTasks, pagination: tasksPagination })
      }),
      http.post('/api/v1/tasks', () => HttpResponse.json(mockTask, { status: 201 })),
    )

    const queryClient = createTestQueryClient()
    const { result } = renderHook(
      () => ({ list: useProjectTasks(projectId, filters), create: useCreateTask() }),
      { wrapper: makeWrapper(queryClient) },
    )

    await waitFor(() => {
      expect(result.current.list.isSuccess).toBe(true)
    })
    expect(getCalls).toBe(1)

    act(() => {
      result.current.create.mutate({ projectId, title: 'Tarea nueva' })
    })

    await waitFor(() => {
      expect(result.current.create.isSuccess).toBe(true)
    })
    await waitFor(() => {
      expect(getCalls).toBe(2)
    })
    expect(await screen.findByText('Tarea creada exitosamente')).toBeInTheDocument()
  })

  it('muestra un toast de error y no invalida cuando la API falla', async () => {
    let getCalls = 0
    server.use(
      http.get('/api/v1/projects/:projectId/tasks', () => {
        getCalls += 1
        return HttpResponse.json({ data: mockTasks, pagination: tasksPagination })
      }),
      http.post('/api/v1/tasks', () => new HttpResponse(null, { status: 500 })),
    )

    const queryClient = createTestQueryClient()
    const { result } = renderHook(
      () => ({ list: useProjectTasks(projectId, filters), create: useCreateTask() }),
      { wrapper: makeWrapper(queryClient) },
    )

    await waitFor(() => {
      expect(result.current.list.isSuccess).toBe(true)
    })

    act(() => {
      result.current.create.mutate({ projectId, title: 'Tarea nueva' })
    })

    await waitFor(() => {
      expect(result.current.create.isError).toBe(true)
    })
    expect(await screen.findByText('Error al crear la tarea')).toBeInTheDocument()
    expect(getCalls).toBe(1)
  })
})

describe('useDeleteTask', () => {
  it('invalida la lista de tareas y muestra un toast de éxito', async () => {
    let getCalls = 0
    server.use(
      http.get('/api/v1/projects/:projectId/tasks', () => {
        getCalls += 1
        return HttpResponse.json({ data: mockTasks, pagination: tasksPagination })
      }),
      http.delete('/api/v1/tasks/:taskId', () => new HttpResponse(null, { status: 204 })),
    )

    const queryClient = createTestQueryClient()
    const { result } = renderHook(
      () => ({ list: useProjectTasks(projectId, filters), remove: useDeleteTask() }),
      { wrapper: makeWrapper(queryClient) },
    )

    await waitFor(() => {
      expect(result.current.list.isSuccess).toBe(true)
    })
    expect(getCalls).toBe(1)

    act(() => {
      result.current.remove.mutate({ taskId: mockTask.id, projectId })
    })

    await waitFor(() => {
      expect(result.current.remove.isSuccess).toBe(true)
    })
    await waitFor(() => {
      expect(getCalls).toBe(2)
    })
    expect(await screen.findByText('Tarea eliminada correctamente')).toBeInTheDocument()
  })

  it('muestra un toast de error y no invalida cuando la API falla', async () => {
    let getCalls = 0
    server.use(
      http.get('/api/v1/projects/:projectId/tasks', () => {
        getCalls += 1
        return HttpResponse.json({ data: mockTasks, pagination: tasksPagination })
      }),
      http.delete('/api/v1/tasks/:taskId', () => new HttpResponse(null, { status: 500 })),
    )

    const queryClient = createTestQueryClient()
    const { result } = renderHook(
      () => ({ list: useProjectTasks(projectId, filters), remove: useDeleteTask() }),
      { wrapper: makeWrapper(queryClient) },
    )

    await waitFor(() => {
      expect(result.current.list.isSuccess).toBe(true)
    })

    act(() => {
      result.current.remove.mutate({ taskId: mockTask.id, projectId })
    })

    await waitFor(() => {
      expect(result.current.remove.isError).toBe(true)
    })
    expect(await screen.findByText('Error al eliminar la tarea')).toBeInTheDocument()
    expect(getCalls).toBe(1)
  })
})
