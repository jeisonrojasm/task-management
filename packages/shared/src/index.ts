// TypeScript types genuinely shared across workspaces.
// These are literal unions identical to the ones defined in
// apps/backend/src/domain/value-objects/. Synchronization is by convention,
// not by import: this package does not import from apps/backend or apps/frontend.
// It contains no runtime and no logic — types only.

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'CANCELLED'
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type ProjectStatus = 'ACTIVE' | 'ARCHIVED'
