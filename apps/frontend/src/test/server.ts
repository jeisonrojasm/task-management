import { setupServer } from 'msw/node'

import { handlers } from './handlers'

// Mock Service Worker (node): intercepts the HTTP calls made by the tests.
export const server = setupServer(...handlers)
