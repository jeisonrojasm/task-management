// Extends the base Jest config (jest.config.ts) without coverageThreshold so
// that running --coverage on integration tests does not fail against per-file
// thresholds that were designed for unit tests. All other properties are kept
// identical to the base config.
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: { '^(\\.{1,2}/.*)\\.js$': '$1' },
  testMatch: ['**/*.spec.ts'],
  globalSetup: '<rootDir>/jest.global-setup.cjs',
  setupFiles: ['<rootDir>/jest.env.setup.cjs'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: true, tsconfig: 'tsconfig.test.json' }],
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/main.ts',
    '!src/infrastructure/database/prisma/client.ts',
    '!src/infrastructure/config/logger.ts',
    '!src/presentation/http/docs/**',
    '!src/**/*.d.ts',
  ],
}
