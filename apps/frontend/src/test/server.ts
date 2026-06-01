import { setupServer } from 'msw/node'

import { handlers } from './handlers'

// Mock Service Worker (node): intercepta las llamadas HTTP de los tests.
export const server = setupServer(...handlers)
