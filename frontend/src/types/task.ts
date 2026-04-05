export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

export interface Task {
  id: number;
  projectId: number;
  name: string;
  datasetIds: number[];
  status: TaskStatus;
  assigneeId?: number;
  reviewComment?: string;
  errorType?: string;
}
