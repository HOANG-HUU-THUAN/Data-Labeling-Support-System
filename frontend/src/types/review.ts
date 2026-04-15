export interface ReviewRequest {
  taskId: number;
  status: 'APPROVED' | 'REJECTED';
  errorCategory?: string;
  comment?: string;
}

export interface ReviewResponse {
  id: number;
  taskId: number;
  reviewerId: number;
  status: string;
  errorCategory?: string;
  comment?: string;
  createdAt: string;
}
