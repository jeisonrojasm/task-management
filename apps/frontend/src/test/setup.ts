import '@testing-library/jest-dom'

import { afterAll, afterEach, beforeAll } from 'vitest'

import { server } from './server'

// jsdom does not implement the pointer/scroll APIs that Radix UI uses internally
// (DropdownMenu, Dialog). Without these no-ops, opening a menu in tests throws.
Element.prototype.hasPointerCapture = (): boolean => false
Element.prototype.setPointerCapture = (): void => undefined
Element.prototype.releasePointerCapture = (): void => undefined
Element.prototype.scrollIntoView = (): void => undefined

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
