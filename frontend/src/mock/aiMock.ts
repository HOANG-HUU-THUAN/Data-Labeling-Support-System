import type { AnnotationType, Point } from '../types/annotation';

export interface AiSuggestion {
  labelId: number;
  type: AnnotationType;
  x: number;
  y: number;
  w: number;
  h: number;
  points?: Point[];
}

/**
 * Simulate POST /ai/auto-label.
 * Returns deterministic fake suggestions based on imageId so results look
 * consistent per image during the same session.
 * @param imageId  – id of the image to label
 * @param labelIds – available label ids for the project
 */
export const autoLabel = (imageId: number, labelIds: number[]): Promise<AiSuggestion[]> => {
  if (labelIds.length === 0) return Promise.resolve([]);

  const l0 = labelIds[0];
  const l1 = labelIds[Math.min(1, labelIds.length - 1)];
  const seed = imageId % 5;

  const suggestions: AiSuggestion[] = [
    {
      labelId: l0,
      type: 'bbox',
      x: 8  + seed * 2,
      y: 10 + seed * 3,
      w: 22 + seed,
      h: 28 + seed,
    },
    {
      labelId: l1,
      type: 'bbox',
      x: 52 + seed * 2,
      y: 15 + seed * 2,
      w: 20 + seed,
      h: 25 + seed,
    },
    {
      labelId: l0,
      type: 'polygon',
      x: 5,
      y: 58,
      w: 35,
      h: 28,
      points: [
        { x: 5,  y: 58 },
        { x: 22, y: 53 },
        { x: 40, y: 60 },
        { x: 38, y: 86 },
        { x: 12, y: 84 },
      ],
    },
  ];

  return new Promise((resolve) => setTimeout(() => resolve(suggestions), 600));
};
