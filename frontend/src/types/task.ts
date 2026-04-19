export interface Task {
  id: number;
  projectId: number;
  projectName?: string;
  name: string;
  datasetIds: number[];
  status: TaskStatus;
  assigneeId?: number;
  assigneeUsername?: string;
  reviewerId?: number;
  reviewerUsername?: string;
  errorCategory?: string;
  comment?: string;
}

export interface MyTask {
  taskId: number;
  projectId: number;
  projectName: string;
  status: TaskStatus;
  assignedAnnotatorId: number;
  assignedAnnotatorUsername?: string;
  assignedReviewerId: number;
  assignedReviewerUsername?: string;
  imageCount: number;
  errorCategory?: string;
  comment?: string;
  createdAt: string;
}

export type TaskStatus = 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED';

export interface AnnotationImage {
  id: number;
  name: string;
  url: string;
  thumbnailUrl: string;
}
