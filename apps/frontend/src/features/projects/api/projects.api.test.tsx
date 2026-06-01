import { type ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { act, renderHook, screen, waitFor } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'

import { useArchiveProject, useCreateProject, useProjects } from './projects.api'

import { server } from '@/test/server'
import { mockProjectA, mockProjects } from '@/test/handlers'
import { createTestQueryClient } from '@/test/renderWithProviders'
import { useToast } from '@/shared/hooks/useToast'

// Minimal probe: subscribes to the real toast store and exposes the title as
// visible text, without depending on the Toaster's Radix primitives.
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

const pagination = {
  page: 1,
  limit: 20,
  total: mockProjects.length,
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

describe('useCreateProject', () => {
  it('invalida la lista de proyectos y muestra un toast de éxito', async () => {
    let getCalls = 0
    server.use(
      http.get('/api/v1/projects', () => {
        getCalls += 1
        return HttpResponse.json({ data: mockProjects, pagination })
      }),
    )

    const queryClient = createTestQueryClient()
    const { result } = renderHook(
      () => ({ list: useProjects({ status: 'ACTIVE' }), create: useCreateProject() }),
      { wrapper: makeWrapper(queryClient) },
    )

    await waitFor(() => {
      expect(result.current.list.isSuccess).toBe(true)
    })
    expect(getCalls).toBe(1)

    act(() => {
      result.current.create.mutate({ name: 'Proyecto nuevo' })
    })

    await waitFor(() => {
      expect(result.current.create.isSuccess).toBe(true)
    })
    // Invalidating ['projects'] forces a refetch of the active query.
    await waitFor(() => {
      expect(getCalls).toBe(2)
    })
    expect(await screen.findByText('Proyecto creado exitosamente')).toBeInTheDocument()
  })

  it('muestra un toast de error y no invalida cuando la API falla', async () => {
    let getCalls = 0
    server.use(
      http.get('/api/v1/projects', () => {
        getCalls += 1
        return HttpResponse.json({ data: mockProjects, pagination })
      }),
      http.post('/api/v1/projects', () => new HttpResponse(null, { status: 500 })),
    )

    const queryClient = createTestQueryClient()
    const { result } = renderHook(
      () => ({ list: useProjects({ status: 'ACTIVE' }), create: useCreateProject() }),
      { wrapper: makeWrapper(queryClient) },
    )

    await waitFor(() => {
      expect(result.current.list.isSuccess).toBe(true)
    })
    expect(getCalls).toBe(1)

    act(() => {
      result.current.create.mutate({ name: 'Proyecto nuevo' })
    })

    await waitFor(() => {
      expect(result.current.create.isError).toBe(true)
    })
    expect(await screen.findByText('Error al crear el proyecto')).toBeInTheDocument()
    expect(getCalls).toBe(1) // onError does not invalidate → no refetch
  })
})

describe('useArchiveProject', () => {
  it('invalida la lista de proyectos y muestra un toast de éxito', async () => {
    let getCalls = 0
    server.use(
      http.get('/api/v1/projects', () => {
        getCalls += 1
        return HttpResponse.json({ data: mockProjects, pagination })
      }),
    )

    const queryClient = createTestQueryClient()
    const { result } = renderHook(
      () => ({ list: useProjects({ status: 'ACTIVE' }), archive: useArchiveProject() }),
      { wrapper: makeWrapper(queryClient) },
    )

    await waitFor(() => {
      expect(result.current.list.isSuccess).toBe(true)
    })
    expect(getCalls).toBe(1)

    act(() => {
      result.current.archive.mutate(mockProjectA.id)
    })

    await waitFor(() => {
      expect(result.current.archive.isSuccess).toBe(true)
    })
    await waitFor(() => {
      expect(getCalls).toBe(2)
    })
    expect(await screen.findByText('Proyecto archivado correctamente')).toBeInTheDocument()
  })

  it('muestra un toast de error y no invalida cuando la API falla', async () => {
    let getCalls = 0
    server.use(
      http.get('/api/v1/projects', () => {
        getCalls += 1
        return HttpResponse.json({ data: mockProjects, pagination })
      }),
      http.delete('/api/v1/projects/:projectId', () => new HttpResponse(null, { status: 500 })),
    )

    const queryClient = createTestQueryClient()
    const { result } = renderHook(
      () => ({ list: useProjects({ status: 'ACTIVE' }), archive: useArchiveProject() }),
      { wrapper: makeWrapper(queryClient) },
    )

    await waitFor(() => {
      expect(result.current.list.isSuccess).toBe(true)
    })

    act(() => {
      result.current.archive.mutate(mockProjectA.id)
    })

    await waitFor(() => {
      expect(result.current.archive.isError).toBe(true)
    })
    expect(await screen.findByText('Error al archivar el proyecto')).toBeInTheDocument()
    expect(getCalls).toBe(1)
  })
})
