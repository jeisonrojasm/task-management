import { useState } from 'react'

interface ProjectFiltersState {
  status: 'ACTIVE' | 'ARCHIVED'
  setStatus: (status: 'ACTIVE' | 'ARCHIVED') => void
  page: number
  setPage: (page: number) => void
  reset: () => void
}

export function useProjectFilters(): ProjectFiltersState {
  const [status, setStatus] = useState<'ACTIVE' | 'ARCHIVED'>('ACTIVE')
  const [page, setPage] = useState(1)

  function reset() {
    setStatus('ACTIVE')
    setPage(1)
  }

  return { status, setStatus, page, setPage, reset }
}
