import { http, HttpResponse } from 'msw'

// Mock data in snake_case — the Axios response interceptor
// (src/shared/lib/axios.ts) camelizes it before it reaches the components.
// Keeping snake_case here keeps the contract faithful to the real backend.

export const mockProjectA = {
  id: '11111111-1111-1111-1111-111111111111',
  name: 'Proyecto Alfa',
  description: 'Primer proyecto de prueba',
  status: 'ACTIVE',
  created_at: '2026-01-10T12:00:00.000Z',
  updated_at: '2026-01-10T12:00:00.000Z',
  task_count: 5,
}

export const mockProjectB = {
  id: '22222222-2222-2222-2222-222222222222',
  name: 'Proyecto Beta',
  description: null,
  status: 'ARCHIVED',
  created_at: '2026-02-15T09:30:00.000Z',
  updated_at: '2026-02-15T09:30:00.000Z',
  task_count: 0,
}

export const mockProjects = [mockProjectA, mockProjectB]

export const mockTask = {
  id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  project_id: mockProjectA.id,
  title: 'Implementar autenticación',
  description: 'Agregar login con JWT',
  status: 'TODO',
  priority: 'HIGH',
  due_date: '2026-03-01',
  is_overdue: false,
  created_at: '2026-01-11T08:00:00.000Z',
  updated_at: '2026-01-11T08:00:00.000Z',
}

export const mockTasks = [mockTask]

export const mockStats = {
  project_id: mockProjectA.id,
  task_count: 5,
  by_status: { TODO: 2, IN_PROGRESS: 1, IN_REVIEW: 0, DONE: 2, CANCELLED: 0 },
  by_priority: { LOW: 1, MEDIUM: 2, HIGH: 1, CRITICAL: 1 },
  overdue_count: 1,
  completion_rate: 0.4,
  ai_insights: {
    summary: 'El proyecto avanza a buen ritmo con 2 de 5 tareas completadas.',
    recommendations: ['Priorizar la tarea crítica pendiente', 'Revisar las tareas vencidas'],
    generated_at: '2026-05-31T10:00:00.000Z',
  },
}

const pagination = {
  page: 1,
  limit: 20,
  total: mockProjects.length,
  total_pages: 1,
  has_next: false,
  has_prev: false,
}

const tasksPagination = {
  page: 1,
  limit: 20,
  total: mockTasks.length,
  total_pages: 1,
  has_next: false,
  has_prev: false,
}

export const handlers = [
  http.get('/api/v1/projects', () => HttpResponse.json({ data: mockProjects, pagination })),

  http.post('/api/v1/projects', async ({ request }) => {
    const body = (await request.json()) as { name: string; description?: string }
    return HttpResponse.json(
      {
        id: '33333333-3333-3333-3333-333333333333',
        name: body.name,
        description: body.description ?? null,
        status: 'ACTIVE',
        created_at: '2026-05-31T12:00:00.000Z',
        updated_at: '2026-05-31T12:00:00.000Z',
        task_count: 0,
      },
      { status: 201 },
    )
  }),

  http.get('/api/v1/projects/:projectId', () => HttpResponse.json(mockProjectA)),

  http.delete('/api/v1/projects/:projectId', () => new HttpResponse(null, { status: 204 })),

  http.get('/api/v1/projects/:projectId/tasks', () =>
    HttpResponse.json({ data: mockTasks, pagination: tasksPagination }),
  ),

  http.patch('/api/v1/tasks/:taskId/status', async ({ request, params }) => {
    const body = (await request.json()) as { status: string }
    return HttpResponse.json({
      ...mockTask,
      id: String(params['taskId']),
      status: body.status,
    })
  }),

  http.get('/api/v1/projects/:projectId/stats', () => HttpResponse.json({ data: mockStats })),
]
