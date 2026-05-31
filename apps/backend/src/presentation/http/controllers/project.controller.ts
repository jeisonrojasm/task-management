import { DomainError, ERROR_CODE } from '../../../domain/errors/domain.error.js'
import {
  mapProject,
  mapProjectWithStats,
  mapProjectStats,
  mapPaginated,
} from '../../mappers/response.mappers.js'

import type { Request, Response, NextFunction } from 'express'
import type { CreateProjectUseCase } from '../../../application/use-cases/projects/create-project.use-case.js'
import type { GetProjectUseCase } from '../../../application/use-cases/projects/get-project.use-case.js'
import type { ListProjectsUseCase } from '../../../application/use-cases/projects/list-projects.use-case.js'
import type { UpdateProjectUseCase } from '../../../application/use-cases/projects/update-project.use-case.js'
import type { ArchiveProjectUseCase } from '../../../application/use-cases/projects/archive-project.use-case.js'
import type { GetProjectStatsUseCase } from '../../../application/use-cases/tasks/get-project-stats.use-case.js'
import type {
  CreateProjectBody,
  UpdateProjectBody,
  ListProjectsQuery,
} from '../../validators/project.validators.js'

export class ProjectController {
  constructor(
    private readonly listProjectsUseCase: ListProjectsUseCase,
    private readonly getProjectUseCase: GetProjectUseCase,
    private readonly createProjectUseCase: CreateProjectUseCase,
    private readonly updateProjectUseCase: UpdateProjectUseCase,
    private readonly archiveProjectUseCase: ArchiveProjectUseCase,
    private readonly getProjectStatsUseCase: GetProjectStatsUseCase,
  ) {}

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as ListProjectsQuery
      const result = await this.listProjectsUseCase.execute({
        ...(query.status !== undefined ? { status: query.status } : {}),
        page: query.page,
        limit: query.limit,
        ...(query.sort !== undefined ? { sort: query.sort } : {}),
        ...(query.order !== undefined ? { order: query.order } : {}),
      })
      res.json(mapPaginated(result, mapProjectWithStats))
    } catch (err) {
      next(err)
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    const projectId = req.params['projectId']
    if (projectId === undefined) {
      next(new DomainError('Missing projectId parameter.', ERROR_CODE.VALIDATION_ERROR))
      return
    }
    try {
      const result = await this.getProjectUseCase.execute({ projectId })
      res.json(mapProject(result))
    } catch (err) {
      next(err)
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as CreateProjectBody
      const result = await this.createProjectUseCase.execute({
        name: body.name,
        ...(body.description !== undefined ? { description: body.description } : {}),
      })
      res.status(201).json(mapProject(result))
    } catch (err) {
      next(err)
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    const projectId = req.params['projectId']
    if (projectId === undefined) {
      next(new DomainError('Missing projectId parameter.', ERROR_CODE.VALIDATION_ERROR))
      return
    }
    try {
      const body = req.body as UpdateProjectBody
      const result = await this.updateProjectUseCase.execute({
        projectId,
        name: body.name,
        description: body.description,
      })
      res.json(mapProject(result))
    } catch (err) {
      next(err)
    }
  }

  async archive(req: Request, res: Response, next: NextFunction): Promise<void> {
    const projectId = req.params['projectId']
    if (projectId === undefined) {
      next(new DomainError('Missing projectId parameter.', ERROR_CODE.VALIDATION_ERROR))
      return
    }
    try {
      await this.archiveProjectUseCase.execute({ projectId })
      res.status(204).send()
    } catch (err) {
      next(err)
    }
  }

  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    const projectId = req.params['projectId']
    if (projectId === undefined) {
      next(new DomainError('Missing projectId parameter.', ERROR_CODE.VALIDATION_ERROR))
      return
    }
    try {
      const result = await this.getProjectStatsUseCase.execute({ projectId })
      res.json({ data: mapProjectStats(result) })
    } catch (err) {
      next(err)
    }
  }
}
