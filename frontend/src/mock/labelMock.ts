import type { Label } from '../types/label';

const labels: Label[] = [
  { id: 1, name: 'Khối u', color: '#e53935', projectId: 1 },
  { id: 2, name: 'Bình thường', color: '#43a047', projectId: 1 },
  { id: 3, name: 'Cần xem lại', color: '#fb8c00', projectId: 1 },
  { id: 4, name: 'Tích cực', color: '#1e88e5', projectId: 2 },
  { id: 5, name: 'Tiêu cực', color: '#e53935', projectId: 2 },
  { id: 6, name: 'Trung lập', color: '#757575', projectId: 2 },
  { id: 7, name: 'Người', color: '#8e24aa', projectId: 3 },
  { id: 8, name: 'Xe hơi', color: '#00897b', projectId: 3 },
  { id: 9, name: 'Động vật', color: '#f4511e', projectId: 3 },
];

export const getLabelsByProject = (projectId: number): Promise<Label[]> =>
  new Promise((resolve) =>
    setTimeout(() => resolve(labels.filter((l) => l.projectId === projectId)), 300)
  );

export const createLabel = (
  data: Pick<Label, 'name' | 'color' | 'projectId'>
): Promise<Label> =>
  new Promise((resolve) =>
    setTimeout(() => {
      const newId = labels.length > 0 ? Math.max(...labels.map((l) => l.id)) + 1 : 1;
      const newLabel: Label = { id: newId, ...data };
      labels.push(newLabel);
      resolve(newLabel);
    }, 300)
  );
