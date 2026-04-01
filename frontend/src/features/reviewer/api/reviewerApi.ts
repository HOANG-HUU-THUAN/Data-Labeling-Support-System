// Types
export interface ReviewTask {
  id: string
  name: string
  status: 'pending' | 'in-progress' | 'completed' | 'approved'
}

export interface TaskImage {
  id: string
  url: string
}

export interface Annotation {
  id: string
  x: number
  y: number
  width: number
  height: number
  label?: string
}

// Mock data
const mockTasks: ReviewTask[] = [
  { id: '1', name: 'Annotate Car Images', status: 'pending' },
  { id: '2', name: 'Label Street Signs', status: 'in-progress' },
  { id: '3', name: 'Identify Pedestrians', status: 'completed' },
  { id: '4', name: 'Mark Obstacles', status: 'pending' },
]

const mockImages: { [taskId: string]: TaskImage[] } = {
  '1': [
    { id: 'img1', url: 'https://via.placeholder.com/800x600?text=Car+1' },
    { id: 'img2', url: 'https://via.placeholder.com/800x600?text=Car+2' },
    { id: 'img3', url: 'https://via.placeholder.com/800x600?text=Car+3' },
  ],
  '2': [
    { id: 'img4', url: 'https://via.placeholder.com/800x600?text=Sign+1' },
    { id: 'img5', url: 'https://via.placeholder.com/800x600?text=Sign+2' },
  ],
  '3': [
    { id: 'img6', url: 'https://via.placeholder.com/800x600?text=Person+1' },
    { id: 'img7', url: 'https://via.placeholder.com/800x600?text=Person+2' },
  ],
}

const mockAnnotations: { [imageId: string]: Annotation[] } = {
  'img1': [
    { id: 'ann1', x: 100, y: 150, width: 200, height: 300, label: 'car' },
    { id: 'ann2', x: 400, y: 200, width: 150, height: 250, label: 'car' },
  ],
  'img2': [
    { id: 'ann3', x: 50, y: 100, width: 180, height: 280, label: 'car' },
  ],
  'img4': [
    { id: 'ann4', x: 300, y: 50, width: 100, height: 150, label: 'stop_sign' },
  ],
}

// API Functions
export const getReviewerTasks = async (): Promise<ReviewTask[]> => {
  // Simulate API delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockTasks)
    }, 500)
  })
}

export const getTaskImages = async (taskId: string): Promise<TaskImage[]> => {
  // Simulate API delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockImages[taskId] || [])
    }, 500)
  })
}

export const getAnnotations = async (imageId: string): Promise<Annotation[]> => {
  // Simulate API delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockAnnotations[imageId] || [])
    }, 500)
  })
}

export const approveTask = async (taskId: string): Promise<void> => {
  // Simulate API delay
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Task ${taskId} approved`)
      // In a real app, you would update the task status on the backend
      const task = mockTasks.find((t) => t.id === taskId)
      if (task) {
        task.status = 'approved'
      }
      resolve()
    }, 500)
  })
}
