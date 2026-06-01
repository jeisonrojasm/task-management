import '@testing-library/jest-dom'

import { afterAll, afterEach, beforeAll } from 'vitest'

import { server } from './server'

// jsdom no implementa las APIs de puntero/scroll que Radix UI usa internamente
// (DropdownMenu, Dialog). Sin estos no-ops, abrir un menú en los tests lanza.
Element.prototype.hasPointerCapture = (): boolean => false
Element.prototype.setPointerCapture = (): void => undefined
Element.prototype.releasePointerCapture = (): void => undefined
Element.prototype.scrollIntoView = (): void => undefined

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
