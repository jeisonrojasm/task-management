export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: { '^(\\.{1,2}/.*)\\.js$': '$1' },
  testMatch: ['**/*.spec.ts'],
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
  coverageThreshold: {
    'src/domain/entities/task.entity.ts': { lines: 95 },
    'src/domain/entities/project.entity.ts': { lines: 80 },
    'src/application/use-cases/tasks/update-task-status.use-case.ts': { lines: 95 },
    'src/application/use-cases/tasks/create-task.use-case.ts': { lines: 90 },
    'src/application/use-cases/projects/archive-project.use-case.ts': { lines: 90 },
    'src/application/use-cases/tasks/get-project-stats.use-case.ts': { lines: 85 },
  },
}
