export type AnnotationType = 'bbox' | 'polygon';

export interface Point {
  x: number;
  y: number;
}

export interface Annotation {
  id: number;
  imageId: number;
  labelId: number;
  type: AnnotationType;
  // bbox fields (required when type === 'bbox')
  x: number;
  y: number;
  w: number;
  h: number;
  // polygon field (required when type === 'polygon')
  points?: Point[];
}
