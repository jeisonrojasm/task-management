import { Router } from 'express'

import { validateBody } from '../middlewares/validate-body.middleware.js'
import { validateQuery } from '../middlewares/validate-query.middleware.js'
import { writeLimiter } from '../middlewares/rate-limiter.middleware.js'
import {
  CreateProjectSchema,
  UpdateProjectSchema,
  ListProjectsQuerySchema,
} from '../../validators/project.validators.js'
import { ListTasksQuerySchema } from '../../validators/task.validators.js'

import type { ProjectController } from '../controllers/project.controller.js'
import type { TaskController } from '../controllers/task.controller.js'

/**
 * @openapi
 * /api/v1/projects:
 *   get:
 *     summary: List projects
 *     description: Returns a paginated list of projects, filterable by status.
 *     tags: [Projects]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, ARCHIVED]
 *         description: Filter by project status (default ACTIVE)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *         description: Items per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [created_at, name]
 *           default: created_at
 *         description: Sort field
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Paginated list of projects
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ProjectListItem'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       429:
 *         description: Rate limit exceeded
 */

/**
 * @openapi
 * /api/v1/projects:
 *   post:
 *     summary: Create a project
 *     tags: [Projects]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *                 example: My First Project
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 example: A project for managing tasks
 *     responses:
 *       201:
 *         description: Project created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         description: Rate limit exceeded
 */

/**
 * @openapi
 * /api/v1/projects/{projectId}/stats:
 *   get:
 *     summary: Get project statistics and AI insights
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Project UUID
 *     responses:
 *       200:
 *         description: Project statistics with AI-generated insights
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     project_id:
 *                       type: string
 *                       format: uuid
 *                     task_count:
 *                       type: integer
 *                     by_status:
 *                       type: object
 *                       properties:
 *                         TODO:
 *                           type: integer
 *                         IN_PROGRESS:
 *                           type: integer
 *                         IN_REVIEW:
 *                           type: integer
 *                         DONE:
 *                           type: integer
 *                         CANCELLED:
 *                           type: integer
 *                     by_priority:
 *                       type: object
 *                       properties:
 *                         LOW:
 *                           type: integer
 *                         MEDIUM:
 *                           type: integer
 *                         HIGH:
 *                           type: integer
 *                         CRITICAL:
 *                           type: integer
 *                     overdue_count:
 *                       type: integer
 *                     completion_rate:
 *                       type: number
 *                       format: float
 *                     ai_insights:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         summary:
 *                           type: string
 *                         recommendations:
 *                           type: array
 *                           items:
 *                             type: string
 *                         generated_at:
 *                           type: string
 *                           format: date-time
 *       404:
 *         description: Project not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

export function createProjectRouter(
  projectController: ProjectController,
  taskController: TaskController,
): Router {
  const router = Router()

  router.get('/', validateQuery(ListProjectsQuerySchema), (req, res, next) => {
    void projectController.list(req, res, next)
  })

  router.post('/', writeLimiter, validateBody(CreateProjectSchema), (req, res, next) => {
    void projectController.create(req, res, next)
  })

  router.get('/:projectId', (req, res, next) => {
    void projectController.getById(req, res, next)
  })

  router.put('/:projectId', writeLimiter, validateBody(UpdateProjectSchema), (req, res, next) => {
    void projectController.update(req, res, next)
  })

  router.delete('/:projectId', writeLimiter, (req, res, next) => {
    void projectController.archive(req, res, next)
  })

  router.get('/:projectId/tasks', validateQuery(ListTasksQuerySchema), (req, res, next) => {
    void taskController.listByProject(req, res, next)
  })

  router.get('/:projectId/stats', (req, res, next) => {
    void projectController.getStats(req, res, next)
  })

  return router
}
