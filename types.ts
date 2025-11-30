
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';
export type Category = 'STUDY' | 'WORK' | 'PERSONAL' | 'OTHER';

// Type for the filter state (includes 'ALL')
export type CategoryFilter = Category | 'ALL';
export type PriorityFilter = Priority | 'ALL';

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string; // YYYY-MM-DD format
  status: TaskStatus;
  priority: Priority;
  category: Category;
  createdAt: number;
}

export type FilterType = 'ALL' | 'TODAY' | 'WEEK';

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}