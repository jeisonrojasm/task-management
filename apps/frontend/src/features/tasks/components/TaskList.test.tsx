import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

import { TaskList } from './TaskList'

import { server } from '@/test/server'
import { mockTask } from '@/test/handlers'
import { renderWithProviders } from '@/test/renderWithProviders'

const projectId = mockTask.project_id

const emptyPagination = {
  page: 1,
  limit: 20,
  total: 0,
  total_pages: 0,
  has_next: false,
  has_prev: false,
}

function renderTaskList() {
  return renderWithProviders(
    <TaskList projectId={projectId} filters={{ page: 1 }} onPageChange={() => undefined} />,
  )
}

describe('TaskList (estados async)', () => {
  it('muestra el skeleton mientras la query está pendiente', () => {
    const { container } = renderTaskList()
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
    expect(screen.queryByText(mockTask.title)).not.toBeInTheDocument()
  })

  it('renderiza las TaskCards cuando hay datos', async () => {
    renderTaskList()
    expect(await screen.findByText(mockTask.title)).toBeInTheDocument()
  })

  it('muestra EmptyState cuando no hay tareas', async () => {
    server.use(
      http.get('/api/v1/projects/:projectId/tasks', () =>
        HttpResponse.json({ data: [], pagination: emptyPagination }),
      ),
    )
    renderTaskList()
    expect(await screen.findByText('Sin tareas')).toBeInTheDocument()
  })

  it('muestra PageError cuando la query falla', async () => {
    server.use(
      http.get('/api/v1/projects/:projectId/tasks', () => new HttpResponse(null, { status: 500 })),
    )
    renderTaskList()
    expect(await screen.findByText('No se pudieron cargar las tareas.')).toBeInTheDocument()
  })

  it('mantiene los datos disponibles (smoke de la lista poblada)', async () => {
    renderTaskList()
    // Confirms it renders the card for the task returned by the handler.
    expect(await screen.findByText(mockTask.title)).toBeInTheDocument()
  })
})
