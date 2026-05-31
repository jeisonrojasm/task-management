export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export const PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const satisfies Record<string, Priority>

export const PRIORITY_VALUES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const

export function isValidPriority(value: unknown): value is Priority {
  return PRIORITY_VALUES.some((s) => s === value)
}
