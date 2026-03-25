export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

export interface Task {
  id: number;
  projectId: number;
  name: string;
  status: TaskStatus;
  assigneeId?: number;
}
