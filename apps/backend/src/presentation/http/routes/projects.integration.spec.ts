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
// POST /api/v1/projects
// ---------------------------------------------------------------------------

describe('POST /api/v1/projects', () => {
  it('201 with created project when body is valid', async () => {
    const res = await request(app)
      .post('/api/v1/projects')
      .send({ name: 'Integration Project', description: 'A test project' })

    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({
      id: expect.any(String),
      name: 'Integration Project',
      description: 'A test project',
      status: 'ACTIVE',
      created_at: expect.any(String),
      updated_at: expect.any(String),
    })
  })

  it('400 with VALIDATION_ERROR and field details when body is empty', async () => {
    const res = await request(app).post('/api/v1/projects').send({})

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
    expect(res.body.error.details).toHaveProperty('name')
  })

  it('400 with field details when name field is missing', async () => {
    const res = await request(app)
      .post('/api/v1/projects')
      .send({ description: 'No name provided' })

    expect(res.status).toBe(400)
    expect(res.body.error.details).toHaveProperty('name')
  })
})

// ---------------------------------------------------------------------------
// GET /api/v1/projects
// ---------------------------------------------------------------------------

describe('GET /api/v1/projects', () => {
  it('200 with empty data and total 0 when no projects exist', async () => {
    const res = await request(app).get('/api/v1/projects')

    expect(res.status).toBe(200)
    expect(res.body.data).toEqual([])
    expect(res.body.pagination.total).toBe(0)
  })

  it('200 with pagination envelope and task_count on each item when projects exist', async () => {
    await prisma.project.create({ data: { name: 'Project A' } })
    await prisma.project.create({ data: { name: 'Project B' } })

    const res = await request(app).get('/api/v1/projects')

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(2)
    expect(res.body.pagination).toMatchObject({ total: 2 })
    expect(typeof res.body.data[0].task_count).toBe('number')
  })
})

// ---------------------------------------------------------------------------
// GET /api/v1/projects/:id
// ---------------------------------------------------------------------------

describe('GET /api/v1/projects/:id', () => {
  it('200 with project data when ID exists', async () => {
    const project = await prisma.project.create({ data: { name: 'Fetch Me' } })

    const res = await request(app).get(`/api/v1/projects/${project.id}`)

    expect(res.status).toBe(200)
    expect(res.body.id).toBe(project.id)
    expect(res.body.name).toBe('Fetch Me')
  })

  it('404 with PROJECT_NOT_FOUND when ID does not exist', async () => {
    const fakeId = crypto.randomUUID()
    const res = await request(app).get(`/api/v1/projects/${fakeId}`)

    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('PROJECT_NOT_FOUND')
  })
})

// ---------------------------------------------------------------------------
// PUT /api/v1/projects/:id
// ---------------------------------------------------------------------------

describe('PUT /api/v1/projects/:id', () => {
  it('200 with updated data when project is active', async () => {
    const project = await prisma.project.create({ data: { name: 'Old Name' } })

    const res = await request(app)
      .put(`/api/v1/projects/${project.id}`)
      .send({ name: 'New Name', description: null })

    expect(res.status).toBe(200)
    expect(res.body.name).toBe('New Name')
  })

  it('422 with PROJECT_ARCHIVED when project is archived', async () => {
    const project = await prisma.project.create({
      data: { name: 'Archived Project', status: 'ARCHIVED' },
    })

    const res = await request(app)
      .put(`/api/v1/projects/${project.id}`)
      .send({ name: 'Attempt', description: null })

    expect(res.status).toBe(422)
    expect(res.body.error.code).toBe('PROJECT_ARCHIVED')
  })
})

// ---------------------------------------------------------------------------
// DELETE /api/v1/projects/:id  (archive)
// ---------------------------------------------------------------------------

describe('DELETE /api/v1/projects/:id', () => {
  it('204 with no body on first call', async () => {
    const project = await prisma.project.create({ data: { name: 'To Archive' } })

    const res = await request(app).delete(`/api/v1/projects/${project.id}`)

    expect(res.status).toBe(204)
    expect(res.body).toEqual({})
  })

  it('project status is ARCHIVED after DELETE (verified via GET)', async () => {
    const project = await prisma.project.create({ data: { name: 'To Archive' } })
    await request(app).delete(`/api/v1/projects/${project.id}`)

    const getRes = await request(app).get(`/api/v1/projects/${project.id}`)

    expect(getRes.body.status).toBe('ARCHIVED')
  })

  it('204 on second DELETE call (idempotent)', async () => {
    const project = await prisma.project.create({ data: { name: 'Archive Twice' } })
    await request(app).delete(`/api/v1/projects/${project.id}`)

    const res = await request(app).delete(`/api/v1/projects/${project.id}`)

    expect(res.status).toBe(204)
  })
})

// ---------------------------------------------------------------------------
// GET /api/v1/projects/:id/stats
// ---------------------------------------------------------------------------

describe('GET /api/v1/projects/:id/stats', () => {
  it('200 with stats shape when project exists', async () => {
    const project = await prisma.project.create({ data: { name: 'Stats Project' } })

    const res = await request(app).get(`/api/v1/projects/${project.id}/stats`)

    expect(res.status).toBe(200)
    expect(res.body.data).toMatchObject({
      task_count: expect.any(Number),
      by_status: expect.any(Object),
      by_priority: expect.any(Object),
      overdue_count: expect.any(Number),
      completion_rate: expect.any(Number),
    })
  })

  it('ai_insights has summary (string) and recommendations (array)', async () => {
    const project = await prisma.project.create({ data: { name: 'AI Project' } })

    const res = await request(app).get(`/api/v1/projects/${project.id}/stats`)

    expect(res.status).toBe(200)
    const insights = res.body.data.ai_insights as {
      summary: unknown
      recommendations: unknown
    } | null
    expect(insights).not.toBeNull()
    expect(typeof insights?.summary).toBe('string')
    expect(Array.isArray(insights?.recommendations)).toBe(true)
  }, 10_000)

  it('404 with PROJECT_NOT_FOUND when ID does not exist', async () => {
    const fakeId = crypto.randomUUID()
    const res = await request(app).get(`/api/v1/projects/${fakeId}/stats`)

    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('PROJECT_NOT_FOUND')
  })
})
