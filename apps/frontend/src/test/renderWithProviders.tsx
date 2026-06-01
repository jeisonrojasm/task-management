import { type ReactElement, type ReactNode } from 'react'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'

// Helper de render para tests. NO es un componente shadcn, por lo que sigue la
// convención camelCase del proyecto (constraint §4.3): export `renderWithProviders`.

// gcTime por defecto en 0 (cliente fresco, sin estado compartido entre tests).
// Los tests que inspeccionan el cache sin un observer montado deben pasar un
// gcTime mayor (p. ej. Infinity): con gcTime 0 una query sin observers se
// recolecta de inmediato y `getQueryData` devolvería undefined.
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

// Wrapper mínimo (solo QueryClient) para tests de hooks con `renderHook`.
export function createQueryWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}
