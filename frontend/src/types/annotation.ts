export interface PointDTO {
  x: number;
  y: number;
}

export interface Annotation {
  id: number;
  imageId: number;
  labelId: number;
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'BOX' | 'POLYGON';
  points?: PointDTO[];
}
