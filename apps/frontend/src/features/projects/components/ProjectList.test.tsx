import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

import { ProjectList } from './ProjectList'

import { server } from '@/test/server'
import { mockProjects } from '@/test/handlers'
import { renderWithProviders } from '@/test/renderWithProviders'

const emptyPagination = {
  page: 1,
  limit: 20,
  total: 0,
  total_pages: 0,
  has_next: false,
  has_prev: false,
}

const fullPagination = {
  page: 1,
  limit: 20,
  total: mockProjects.length,
  total_pages: 1,
  has_next: false,
  has_prev: false,
}

function renderList() {
  return renderWithProviders(
    <ProjectList filters={{}} onCreateProject={() => undefined} onPageChange={() => undefined} />,
  )
}

describe('ProjectList (estados async)', () => {
  it('muestra LoadingSkeleton mientras la query está pendiente', () => {
    const { container } = renderList()
    // El esqueleto es lo único observable mientras carga: aún no hay datos ni vacío.
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
    expect(screen.queryByText('Proyecto Alfa')).not.toBeInTheDocument()
  })

  it('renderiza ProjectCards cuando hay datos', async () => {
    renderList()
    expect(await screen.findByText('Proyecto Alfa')).toBeInTheDocument()
    expect(screen.getByText('Proyecto Beta')).toBeInTheDocument()
  })

  it('muestra EmptyState cuando la API retorna un array vacío', async () => {
    server.use(
      http.get('/api/v1/projects', () =>
        HttpResponse.json({ data: [], pagination: emptyPagination }),
      ),
    )
    renderList()
    expect(await screen.findByText('Sin proyectos')).toBeInTheDocument()
  })

  it('muestra PageError cuando la query falla', async () => {
    server.use(http.get('/api/v1/projects', () => new HttpResponse(null, { status: 500 })))
    renderList()
    expect(await screen.findByText('No se pudo cargar la lista de proyectos.')).toBeInTheDocument()
  })

  it('el botón "Intentar de nuevo" dispara un refetch exitoso', async () => {
    let calls = 0
    server.use(
      http.get('/api/v1/projects', () => {
        calls += 1
        if (calls === 1) {
          return new HttpResponse(null, { status: 500 })
        }
        return HttpResponse.json({ data: mockProjects, pagination: fullPagination })
      }),
    )

    const { user } = renderList()

    const retry = await screen.findByRole('button', { name: 'Intentar de nuevo' })
    await user.click(retry)

    expect(await screen.findByText('Proyecto Alfa')).toBeInTheDocument()
  })
})
