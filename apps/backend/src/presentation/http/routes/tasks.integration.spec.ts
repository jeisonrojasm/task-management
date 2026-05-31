import request from 'supertest'

import { createApp } from '../../../main.js'
import prisma from '../../../infrastructure/database/prisma/client.js'

import type { Express } from 'express'

let app: Express

beforeAll(async () => {
  app = await createApp()
  await prisma.$connect()
})

afterAll(async () => {
  await prisma.$disconnect()
})

beforeEach(async () => {
  await prisma.task.deleteMany()
  await prisma.project.deleteMany()
})

// ---------------------------------------------------------------------------
// POST /api/v1/tasks
// ---------------------------------------------------------------------------

describe('POST /api/v1/tasks', () => {
  it('201 with created task when body is valid and project is active', async () => {
    const project = await prisma.project.create({ data: { name: 'Active Project' } })

    const res = await request(app).post('/api/v1/tasks').send({
      project_id: project.id,
      title: 'New Task',
    })

    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({
      id: expect.any(String),
      project_id: project.id,
      title: 'New Task',
      status: 'TODO',
      priority: 'MEDIUM',
    })
  })

  it('404 with PROJECT_NOT_FOUND when project_id does not exist', async () => {
    const res = await request(app).post('/api/v1/tasks').send({
      project_id: crypto.randomUUID(),
      title: 'Orphan Task',
    })

    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('PROJECT_NOT_FOUND')
  })

  it('422 with PROJECT_ARCHIVED when project is archived', async () => {
    const project = await prisma.project.create({
      data: { name: 'Archived', status: 'ARCHIVED' },
    })

    const res = await request(app).post('/api/v1/tasks').send({
      project_id: project.id,
      title: 'Task on archived',
    })

    expect(res.status).toBe(422)
    expect(res.body.error.code).toBe('PROJECT_ARCHIVED')
  })

  it('400 with field details when title is empty', async () => {
    const project = await prisma.project.create({ data: { name: 'Project' } })

    const res = await request(app).post('/api/v1/tasks').send({
      project_id: project.id,
      title: '',
    })

    expect(res.status).toBe(400)
    expect(res.body.error.details).toHaveProperty('title')
  })

  it('400 with VALIDATION_ERROR when project_id is not a valid UUID', async () => {
    const res = await request(app).post('/api/v1/tasks').send({
      project_id: 'not-a-uuid',
      title: 'Task',
    })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })
})

// ---------------------------------------------------------------------------
// GET /api/v1/tasks/:id
// ---------------------------------------------------------------------------

describe('GET /api/v1/tasks/:id', () => {
  it('200 with task including is_overdue field when ID exists', async () => {
    const project = await prisma.project.create({ data: { name: 'Project' } })
    const task = await prisma.task.create({
      data: { projectId: project.id, title: 'My Task' },
    })

    const res = await request(app).get(`/api/v1/tasks/${task.id}`)

    expect(res.status).toBe(200)
    expect(res.body.id).toBe(task.id)
    expect(typeof res.body.is_overdue).toBe('boolean')
  })

  it('404 with TASK_NOT_FOUND when ID does not exist', async () => {
    const res = await request(app).get(`/api/v1/tasks/${crypto.randomUUID()}`)

    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('TASK_NOT_FOUND')
  })
})

// ---------------------------------------------------------------------------
// PUT /api/v1/tasks/:id
// ---------------------------------------------------------------------------

describe('PUT /api/v1/tasks/:id', () => {
  it('200 with updated task on valid update', async () => {
    const project = await prisma.project.create({ data: { name: 'Project' } })
    const task = await prisma.task.create({
      data: { projectId: project.id, title: 'Original' },
    })

    const res = await request(app)
      .put(`/api/v1/tasks/${task.id}`)
      .send({ title: 'Updated', description: null, priority: 'HIGH', due_date: null })

    expect(res.status).toBe(200)
    expect(res.body.title).toBe('Updated')
    expect(res.body.priority).toBe('HIGH')
  })

  it('400 when title is empty', async () => {
    const project = await prisma.project.create({ data: { name: 'Project' } })
    const task = await prisma.task.create({
      data: { projectId: project.id, title: 'Original' },
    })

    const res = await request(app)
      .put(`/api/v1/tasks/${task.id}`)
      .send({ title: '', description: null, priority: 'MEDIUM', due_date: null })

    expect(res.status).toBe(400)
  })
})

// ---------------------------------------------------------------------------
// PATCH /api/v1/tasks/:id/status
// ---------------------------------------------------------------------------

describe('PATCH /api/v1/tasks/:id/status', () => {
  it('200 with IN_PROGRESS status after valid TODO → IN_PROGRESS transition', async () => {
    const project = await prisma.project.create({ data: { name: 'Project' } })
    const task = await prisma.task.create({
      data: { projectId: project.id, title: 'Task', status: 'TODO' },
    })

    const res = await request(app)
      .patch(`/api/v1/tasks/${task.id}/status`)
      .send({ status: 'IN_PROGRESS' })

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('IN_PROGRESS')
  })

  it('422 with INVALID_TASK_STATUS_TRANSITION for DONE → IN_PROGRESS', async () => {
    const project = await prisma.project.create({ data: { name: 'Project' } })
    const task = await prisma.task.create({
      data: { projectId: project.id, title: 'Task', status: 'DONE' },
    })

    const res = await request(app)
      .patch(`/api/v1/tasks/${task.id}/status`)
      .send({ status: 'IN_PROGRESS' })

    expect(res.status).toBe(422)
    expect(res.body.error.code).toBe('INVALID_TASK_STATUS_TRANSITION')
  })

  it('400 with VALIDATION_ERROR when status value is not recognized', async () => {
    const project = await prisma.project.create({ data: { name: 'Project' } })
    const task = await prisma.task.create({
      data: { projectId: project.id, title: 'Task' },
    })

    const res = await request(app)
      .patch(`/api/v1/tasks/${task.id}/status`)
      .send({ status: 'FLYING' })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })
})

// ---------------------------------------------------------------------------
// DELETE /api/v1/tasks/:id
// ---------------------------------------------------------------------------

describe('DELETE /api/v1/tasks/:id', () => {
  it('204 with no body when task exists', async () => {
    const project = await prisma.project.create({ data: { name: 'Project' } })
    const task = await prisma.task.create({
      data: { projectId: project.id, title: 'Task to delete' },
    })

    const res = await request(app).delete(`/api/v1/tasks/${task.id}`)

    expect(res.status).toBe(204)
    expect(res.body).toEqual({})
  })

  it('404 with TASK_NOT_FOUND when ID does not exist', async () => {
    const res = await request(app).delete(`/api/v1/tasks/${crypto.randomUUID()}`)

    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('TASK_NOT_FOUND')
  })
})

// ---------------------------------------------------------------------------
// GET /api/v1/projects/:id/tasks
// ---------------------------------------------------------------------------

describe('GET /api/v1/projects/:id/tasks', () => {
  it('200 with empty data array for project with no tasks', async () => {
    const project = await prisma.project.create({ data: { name: 'Empty Project' } })

    const res = await request(app).get(`/api/v1/projects/${project.id}/tasks`)

    expect(res.status).toBe(200)
    expect(res.body.data).toEqual([])
  })

  it('200 with only TODO tasks when filtering by ?status=TODO', async () => {
    const project = await prisma.project.create({ data: { name: 'Project' } })
    await prisma.task.create({
      data: { projectId: project.id, title: 'Todo Task', status: 'TODO' },
    })
    await prisma.task.create({
      data: { projectId: project.id, title: 'Done Task', status: 'DONE' },
    })

    const res = await request(app).get(`/api/v1/projects/${project.id}/tasks?status=TODO`)

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(1)
    expect(res.body.data[0].status).toBe('TODO')
  })

  it('400 with VALIDATION_ERROR when limit exceeds maximum (200 > 100)', async () => {
    const project = await prisma.project.create({ data: { name: 'Project' } })

    const res = await request(app).get(`/api/v1/projects/${project.id}/tasks?limit=200`)

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })
})
