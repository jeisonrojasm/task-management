import { useState } from 'react'

import type { TaskStatus, Priority } from '../types'

import { usePagination } from '@/shared/hooks/usePagination'

export function useTaskFilters(): {
  status: TaskStatus | undefined
  priority: Priority | undefined
  page: number
  setStatus: (s: TaskStatus | undefined) => void
  setPriority: (p: Priority | undefined) => void
  setPage: (p: number) => void
  reset: () => void
} {
  const [status, setStatusState] = useState<TaskStatus | undefined>(undefined)
  const [priority, setPriorityState] = useState<Priority | undefined>(undefined)
  const { page, setPage, reset: resetPagination } = usePagination(1, 20)

  function setStatus(s: TaskStatus | undefined) {
    setStatusState(s)
    setPage(1)
  }

  function setPriority(p: Priority | undefined) {
    setPriorityState(p)
    setPage(1)
  }

  function reset() {
    setStatusState(undefined)
    setPriorityState(undefined)
    resetPagination()
  }

  return {
    status,
    priority,
    page,
    setStatus,
    setPriority,
    setPage,
    reset,
  }
}
