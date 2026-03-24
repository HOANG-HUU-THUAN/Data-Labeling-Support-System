/**
 * Enum các loại dự án
 */
export enum ProjectType {
  OBJECT_DETECTION = 'OBJECT_DETECTION',
  IMAGE_CLASSIFICATION = 'IMAGE_CLASSIFICATION',
  SEGMENTATION = 'SEGMENTATION',
}

/**
 * Interface định nghĩa cấu trúc của một Project
 */
export interface Project {
  id: number;
  name: string;
  description: string;
  type?: string;
}
