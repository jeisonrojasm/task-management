import { z } from 'zod'

import { PROJECT_STATUS_VALUES } from '../../domain/value-objects/project-status.js'

export const CreateProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().max(1000).optional(),
})

export const UpdateProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().max(1000).nullable(),
})

export const ListProjectsQuerySchema = z.object({
  status: z.enum(PROJECT_STATUS_VALUES).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional(),
})

export type CreateProjectBody = z.infer<typeof CreateProjectSchema>
export type UpdateProjectBody = z.infer<typeof UpdateProjectSchema>
export type ListProjectsQuery = z.infer<typeof ListProjectsQuerySchema>
