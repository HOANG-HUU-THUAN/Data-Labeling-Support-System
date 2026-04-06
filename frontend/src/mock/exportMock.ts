import { getTasks } from './taskMock';
import type { ExportFormat } from '../types/export';

interface AnnotationEntry {
  taskId: number;
  image: string;
  annotations: { label: string; x: number; y: number; w: number; h: number }[];
}

export async function exportProject(
  projectId: number,
  format: ExportFormat,
): Promise<string> {
  const tasks = await getTasks();
  const approved = tasks.filter(
    (t) => t.status === 'APPROVED' && t.projectId === projectId,
  );

  const data: AnnotationEntry[] = approved.map((t) => ({
    taskId: t.id,
    image: `image_${t.id}.jpg`,
    annotations: [{ label: 'object', x: 100, y: 100, w: 50, h: 50 }],
  }));

  if (format === 'json') {
    return JSON.stringify(data, null, 2);
  }

  if (format === 'yolo') {
    return data
      .map((d) =>
        d.annotations.map((a) => `0 ${a.x} ${a.y} ${a.w} ${a.h}`).join('\n'),
      )
      .join('\n\n');
  }

  // coco
  const coco = {
    images: data.map((d, i) => ({ id: i, file_name: d.image })),
    annotations: data.flatMap((d, i) =>
      d.annotations.map((a, j) => ({
        id: j,
        image_id: i,
        bbox: [a.x, a.y, a.w, a.h],
        category_id: 1,
      })),
    ),
  };
  return JSON.stringify(coco, null, 2);
}
