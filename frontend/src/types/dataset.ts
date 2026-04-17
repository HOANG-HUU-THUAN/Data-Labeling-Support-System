export interface Dataset {
  id: number;
  projectId: number;
  name: string;
  imageCount: number;
  createdAt: string;
}

export interface DatasetImage {
  id: number;
  name: string;
  url: string;
  thumbnail: string;
  status: string;
}
