import { type ReactElement, type ReactNode } from 'react'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'

// Render helper for tests. It is NOT a shadcn component, so it follows the
// project's camelCase convention: export `renderWithProviders`.

// gcTime defaults to 0 (fresh client, no state shared between tests).
// Tests that inspect the cache without a mounted observer must pass a
// larger gcTime (e.g. Infinity): with gcTime 0 a query without observers is
// garbage-collected immediately and `getQueryData` would return undefined.
export function createTestQueryClient(gcTime = 0): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime },
      mutations: { retry: false },
    },
  })
}

interface RenderOptions {
  initialEntries?: string[]
  queryClient?: QueryClient
}

export function renderWithProviders(ui: ReactElement, options: RenderOptions = {}) {
  const queryClient = options.queryClient ?? createTestQueryClient()
  const initialEntries = options.initialEntries ?? ['/']

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
      </QueryClientProvider>
    )
  }

  return {
    user: userEvent.setup(),
    queryClient,
    ...render(ui, { wrapper: Wrapper }),
  }
}

// Minimal wrapper (QueryClient only) for hook tests using `renderHook`.
export function createQueryWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}
