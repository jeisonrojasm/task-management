import path from 'path'

import { coverageConfigDefaults, defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    passWithNoTests: true,
    coverage: {
      reporter: ['text', 'lcov'],
      exclude: [
        // Mantener las exclusiones por defecto de Vitest (node_modules,
        // **/*.config.*, **/*.test.*, **/*.d.ts, etc.). Definir `exclude`
        // sin esto las reemplazaría y contaminaría el cálculo.
        ...coverageConfigDefaults.exclude,
        // Configs de build no cubiertos por la lista por defecto de Vitest
        // (postcss, tailwind, etc.).
        '**/*.config.{js,cjs,mjs,ts}',
        // Infraestructura de testing (MSW, helpers de render).
        'src/test/**',
        // Entrypoint y bootstrap/composición de la app (wiring, no lógica).
        'src/main.tsx',
        'src/app/**',
        // Barrels: solo re-exports, sin código ejecutable propio.
        'src/**/index.ts',
        // Primitivos de UI generados por shadcn (terceros, no autoría propia).
        'src/shared/components/ui/**',
        // Módulos exclusivamente de tipos (sin statements ejecutables).
        'src/shared/types/**',
        'src/features/projects/types.ts',
        'src/features/dashboard/types.ts',
      ],
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
