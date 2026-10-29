/** Shared types for technical scaffolding; versioned DTOs follow after Phase 0 approval. */
export interface BranchScope {
  organizationId: string;
  branchId: string;
}

export interface SystemStatusResponse {
  service: 'restaurant-os-api';
  phase: '0.1';
  status: 'scaffold';
}
