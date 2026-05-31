import { z } from 'zod'

import { TASK_STATUS_VALUES } from '../../domain/value-objects/task-status.js'
import { PRIORITY_VALUES } from '../../domain/value-objects/priority.js'

export const CreateTaskSchema = z.object({
  project_id: z.string().uuid('project_id must be a valid UUID'),
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional(),
  priority: z.enum(PRIORITY_VALUES).optional(),
  due_date: z.string().date().optional(),
})

export const UpdateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().nullable(),
  priority: z.enum(PRIORITY_VALUES),
  due_date: z.string().date().nullable(),
})

export const UpdateTaskStatusSchema = z.object({
  status: z.enum(TASK_STATUS_VALUES),
})

export const ListTasksQuerySchema = z.object({
  status: z.enum(TASK_STATUS_VALUES).optional(),
  priority: z.enum(PRIORITY_VALUES).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional(),
})

export type CreateTaskBody = z.infer<typeof CreateTaskSchema>
export type UpdateTaskBody = z.infer<typeof UpdateTaskSchema>
export type UpdateTaskStatusBody = z.infer<typeof UpdateTaskStatusSchema>
export type ListTasksQuery = z.infer<typeof ListTasksQuerySchema>
