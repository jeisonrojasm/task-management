import { DomainError, ERROR_CODE } from '../../../domain/errors/domain.error.js'
import { mapTask, mapPaginated } from '../../mappers/response.mappers.js'

import type { Request, Response, NextFunction } from 'express'
import type { CreateTaskUseCase } from '../../../application/use-cases/tasks/create-task.use-case.js'
import type { GetTaskUseCase } from '../../../application/use-cases/tasks/get-task.use-case.js'
import type { UpdateTaskUseCase } from '../../../application/use-cases/tasks/update-task.use-case.js'
import type { DeleteTaskUseCase } from '../../../application/use-cases/tasks/delete-task.use-case.js'
import type { UpdateTaskStatusUseCase } from '../../../application/use-cases/tasks/update-task-status.use-case.js'
import type { ListProjectTasksUseCase } from '../../../application/use-cases/tasks/list-project-tasks.use-case.js'
import type {
  CreateTaskBody,
  UpdateTaskBody,
  UpdateTaskStatusBody,
  ListTasksQuery,
} from '../../validators/task.validators.js'

export class TaskController {
  constructor(
    private readonly createTaskUseCase: CreateTaskUseCase,
    private readonly getTaskUseCase: GetTaskUseCase,
    private readonly updateTaskUseCase: UpdateTaskUseCase,
    private readonly deleteTaskUseCase: DeleteTaskUseCase,
    private readonly updateTaskStatusUseCase: UpdateTaskStatusUseCase,
    private readonly listProjectTasksUseCase: ListProjectTasksUseCase,
  ) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as CreateTaskBody
      const result = await this.createTaskUseCase.execute({
        projectId: body.project_id,
        title: body.title,
        ...(body.description !== undefined ? { description: body.description } : {}),
        ...(body.priority !== undefined ? { priority: body.priority } : {}),
        ...(body.due_date !== undefined ? { dueDate: body.due_date } : {}),
      })
      res.status(201).json(mapTask(result))
    } catch (err) {
      next(err)
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    const taskId = req.params['taskId']
    if (taskId === undefined) {
      next(new DomainError('Missing taskId parameter.', ERROR_CODE.VALIDATION_ERROR))
      return
    }
    try {
      const result = await this.getTaskUseCase.execute({ taskId })
      res.json(mapTask(result))
    } catch (err) {
      next(err)
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    const taskId = req.params['taskId']
    if (taskId === undefined) {
      next(new DomainError('Missing taskId parameter.', ERROR_CODE.VALIDATION_ERROR))
      return
    }
    try {
      const body = req.body as UpdateTaskBody
      const result = await this.updateTaskUseCase.execute({
        taskId,
        title: body.title,
        description: body.description,
        priority: body.priority,
        dueDate: body.due_date,
      })
      res.json(mapTask(result))
    } catch (err) {
      next(err)
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    const taskId = req.params['taskId']
    if (taskId === undefined) {
      next(new DomainError('Missing taskId parameter.', ERROR_CODE.VALIDATION_ERROR))
      return
    }
    try {
      await this.deleteTaskUseCase.execute({ taskId })
      res.status(204).send()
    } catch (err) {
      next(err)
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    const taskId = req.params['taskId']
    if (taskId === undefined) {
      next(new DomainError('Missing taskId parameter.', ERROR_CODE.VALIDATION_ERROR))
      return
    }
    try {
      const body = req.body as UpdateTaskStatusBody
      const result = await this.updateTaskStatusUseCase.execute({
        taskId,
        newStatus: body.status,
      })
      res.json(mapTask(result))
    } catch (err) {
      next(err)
    }
  }

  async listByProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    const projectId = req.params['projectId']
    if (projectId === undefined) {
      next(new DomainError('Missing projectId parameter.', ERROR_CODE.VALIDATION_ERROR))
      return
    }
    try {
      const query = req.query as unknown as ListTasksQuery
      const result = await this.listProjectTasksUseCase.execute({
        projectId,
        ...(query.status !== undefined ? { status: query.status } : {}),
        ...(query.priority !== undefined ? { priority: query.priority } : {}),
        page: query.page,
        limit: query.limit,
        ...(query.sort !== undefined ? { sort: query.sort } : {}),
        ...(query.order !== undefined ? { order: query.order } : {}),
      })
      res.json(mapPaginated(result, mapTask))
    } catch (err) {
      next(err)
    }
  }
}
