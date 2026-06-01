import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'
import { AppProviders } from '@/app/providers/AppProviders'
import { AppRouter } from '@/app/router'

const rootElement = document.getElementById('root')
if (rootElement === null) {
  throw new Error('Root element #root not found in document')
}

createRoot(rootElement).render(
  <StrictMode>
    <AppProviders>
      <AppRouter />
    </AppProviders>
  </StrictMode>,
)
