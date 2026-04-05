import { getTasks } from './taskMock';
import type { Task } from '../types/task';

export const getMyTasks = (userId: number): Promise<Task[]> =>
  getTasks().then((all) => all.filter((t) => t.assigneeId === userId));
