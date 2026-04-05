import type { Annotation } from '../types/annotation';

let annotations: Annotation[] = [];
let nextId = 1;

// imageId → userId of the holder
const imageLocks: Record<number, number> = {};

/** Returns { locked: true } if someone else holds the lock, otherwise acquires it. */
export const lockImage = (
  imageId: number,
  userId: number
): Promise<{ locked: boolean }> =>
  new Promise((resolve) =>
    setTimeout(() => {
      if (imageLocks[imageId] !== undefined && imageLocks[imageId] !== userId) {
        resolve({ locked: true });
      } else {
        imageLocks[imageId] = userId;
        resolve({ locked: false });
      }
    }, 100)
  );

/** Synchronous release — fire-and-forget on image switch / page leave. */
export const unlockImage = (imageId: number): void => {
  delete imageLocks[imageId];
};

export const getAnnotationsByImage = (imageId: number): Promise<Annotation[]> =>
  new Promise((resolve) =>
    setTimeout(() => resolve(annotations.filter((a) => a.imageId === imageId)), 300)
  );

export const createAnnotation = (data: Omit<Annotation, 'id'>): Promise<Annotation> =>
  new Promise((resolve) =>
    setTimeout(() => {
      const ann: Annotation = { id: nextId++, ...data };
      annotations.push(ann);
      resolve(ann);
    }, 300)
  );

export const updateAnnotation = (
  id: number,
  data: Partial<Omit<Annotation, 'id' | 'imageId'>>
): Promise<Annotation> =>
  new Promise((resolve, reject) =>
    setTimeout(() => {
      const idx = annotations.findIndex((a) => a.id === id);
      if (idx === -1) { reject(new Error('Không tìm thấy annotation')); return; }
      annotations[idx] = { ...annotations[idx], ...data };
      resolve(annotations[idx]);
    }, 300)
  );

export const deleteAnnotation = (id: number): Promise<void> =>
  new Promise((resolve) =>
    setTimeout(() => {
      annotations = annotations.filter((a) => a.id !== id);
      resolve();
    }, 300)
  );
