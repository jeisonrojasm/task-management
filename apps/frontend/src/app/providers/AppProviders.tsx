import { type ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { BrowserRouter } from 'react-router-dom'

import { Toaster } from '@/shared/components/ui/toaster'
import { queryClient } from '@/shared/lib/query-client'

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {import.meta.env.DEV ? <ReactQueryDevtools initialIsOpen={false} /> : null}
      <Toaster />
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  )
}
