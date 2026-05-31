import { canTransitionTo, isTaskOverdue, type Task } from './task.entity.js'

import type { TaskStatus } from '../value-objects/task-status.js'

function buildTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    projectId: 'project-1',
    title: 'Test Task',
    description: null,
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

describe('canTransitionTo', () => {
  describe('valid transitions', () => {
    const cases: [TaskStatus, TaskStatus][] = [
      ['TODO', 'IN_PROGRESS'],
      ['TODO', 'CANCELLED'],
      ['IN_PROGRESS', 'IN_REVIEW'],
      ['IN_PROGRESS', 'TODO'],
      ['IN_PROGRESS', 'CANCELLED'],
      ['IN_REVIEW', 'DONE'],
      ['IN_REVIEW', 'IN_PROGRESS'],
      ['IN_REVIEW', 'CANCELLED'],
    ]

    test.each(cases)('%s → %s returns true', (from, to) => {
      expect(canTransitionTo(from, to)).toBe(true)
    })
  })

  describe('terminal states — DONE has no outgoing transitions', () => {
    const cases: [TaskStatus, TaskStatus][] = [
      ['DONE', 'IN_PROGRESS'],
      ['DONE', 'TODO'],
      ['DONE', 'IN_REVIEW'],
      ['DONE', 'CANCELLED'],
    ]

    test.each(cases)('DONE → %s returns false', (_from, to) => {
      expect(canTransitionTo('DONE', to)).toBe(false)
    })
  })

  describe('terminal states — CANCELLED has no outgoing transitions', () => {
    const cases: [TaskStatus, TaskStatus][] = [
      ['CANCELLED', 'TODO'],
      ['CANCELLED', 'IN_PROGRESS'],
      ['CANCELLED', 'IN_REVIEW'],
      ['CANCELLED', 'DONE'],
    ]

    test.each(cases)('CANCELLED → %s returns false', (_from, to) => {
      expect(canTransitionTo('CANCELLED', to)).toBe(false)
    })
  })

  describe('invalid skips', () => {
    it('TODO → DONE returns false (cannot skip to terminal)', () => {
      expect(canTransitionTo('TODO', 'DONE')).toBe(false)
    })

    it('TODO → IN_REVIEW returns false (cannot skip a step)', () => {
      expect(canTransitionTo('TODO', 'IN_REVIEW')).toBe(false)
    })
  })
})

describe('isTaskOverdue', () => {
  const yesterday = new Date(Date.now() - 86_400_000)
  const tomorrow = new Date(Date.now() + 86_400_000)

  it('returns true when dueDate is in the past and status is TODO', () => {
    const task = buildTask({ dueDate: yesterday, status: 'TODO' })
    expect(isTaskOverdue(task)).toBe(true)
  })

  it('returns true when dueDate is in the past and status is IN_PROGRESS', () => {
    const task = buildTask({ dueDate: yesterday, status: 'IN_PROGRESS' })
    expect(isTaskOverdue(task)).toBe(true)
  })

  it('returns false when dueDate is in the past but status is DONE', () => {
    const task = buildTask({ dueDate: yesterday, status: 'DONE' })
    expect(isTaskOverdue(task)).toBe(false)
  })

  it('returns false when dueDate is in the past but status is CANCELLED', () => {
    const task = buildTask({ dueDate: yesterday, status: 'CANCELLED' })
    expect(isTaskOverdue(task)).toBe(false)
  })

  it('returns false when dueDate is null', () => {
    const task = buildTask({ dueDate: null, status: 'TODO' })
    expect(isTaskOverdue(task)).toBe(false)
  })

  it('returns false when dueDate is in the future and status is TODO', () => {
    const task = buildTask({ dueDate: tomorrow, status: 'TODO' })
    expect(isTaskOverdue(task)).toBe(false)
  })
})
