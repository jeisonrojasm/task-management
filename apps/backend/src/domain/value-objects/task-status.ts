export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'CANCELLED'

export const TASK_STATUS = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  IN_REVIEW: 'IN_REVIEW',
  DONE: 'DONE',
  CANCELLED: 'CANCELLED',
} as const satisfies Record<string, TaskStatus>

export const TASK_STATUS_VALUES: readonly TaskStatus[] = [
  'TODO',
  'IN_PROGRESS',
  'IN_REVIEW',
  'DONE',
  'CANCELLED',
] as const

export function isValidTaskStatus(value: unknown): value is TaskStatus {
  return TASK_STATUS_VALUES.some((s) => s === value)
}
