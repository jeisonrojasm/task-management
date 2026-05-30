export type ProjectStatus = 'ACTIVE' | 'ARCHIVED';

export const PROJECT_STATUS = {
  ACTIVE: 'ACTIVE',
  ARCHIVED: 'ARCHIVED',
} as const satisfies Record<string, ProjectStatus>;
