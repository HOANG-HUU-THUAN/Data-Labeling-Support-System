export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'LOCK'
  | 'UNLOCK'
  | 'APPROVE'
  | 'REJECT'
  | 'EXPORT';

export type AuditEntity = 'USER' | 'PROJECT' | 'TASK' | 'ANNOTATION' | 'DATASET' | 'AUTH';

export interface AuditLog {
  id: number;
  user: string;
  action: AuditAction;
  entity: AuditEntity;
  entityId: number;
  detail: string;
  createdAt: string; // ISO string
}

export interface AuditLogFilters {
  user?: string;
  action?: string;
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
}
