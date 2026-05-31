import { Router } from 'express'

import { validateBody } from '../middlewares/validate-body.middleware.js'
import { writeLimiter } from '../middlewares/rate-limiter.middleware.js'
import {
  CreateTaskSchema,
  UpdateTaskSchema,
  UpdateTaskStatusSchema,
} from '../../validators/task.validators.js'

import type { TaskController } from '../controllers/task.controller.js'

/**
 * @openapi
 * /api/v1/tasks/{taskId}/status:
 *   patch:
 *     summary: Update task status
 *     description: Transitions a task to a new status. Only valid transitions are allowed.
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Task UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [TODO, IN_PROGRESS, IN_REVIEW, DONE, CANCELLED]
 *                 example: IN_PROGRESS
 *     responses:
 *       200:
 *         description: Task with updated status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Task not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       422:
 *         description: Invalid status transition
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         description: Rate limit exceeded
 */

export function createTaskRouter(taskController: TaskController): Router {
  const router = Router()

  router.post('/', writeLimiter, validateBody(CreateTaskSchema), (req, res, next) => {
    void taskController.create(req, res, next)
  })

  router.get('/:taskId', (req, res, next) => {
    void taskController.getById(req, res, next)
  })

  router.put('/:taskId', writeLimiter, validateBody(UpdateTaskSchema), (req, res, next) => {
    void taskController.update(req, res, next)
  })

  router.delete('/:taskId', writeLimiter, (req, res, next) => {
    void taskController.delete(req, res, next)
  })

  router.patch(
    '/:taskId/status',
    writeLimiter,
    validateBody(UpdateTaskStatusSchema),
    (req, res, next) => {
      void taskController.updateStatus(req, res, next)
    },
  )

  return router
}
