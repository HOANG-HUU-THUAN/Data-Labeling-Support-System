export interface AuditLog {
  id: number;
  username: string;
  action: string;
  ipAddress: string;
  details: string;
  createdAt: string;
}
