export interface Label {
  id: number;
  name: string;
  color: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  type: 'IMAGE_CLASSIFICATION' | 'OBJECT_DETECTION';
  guideline?: string;
  labels: Label[];
}
