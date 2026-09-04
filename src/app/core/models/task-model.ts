export interface Task {
  _id: string;
  user: string;
  title: string;
  description?: string;
  dueDate: string;
  priority: 'Low' | 'Medium' | 'High';
  completed: boolean;
  completedAt?: string ;
  createdAt: string;
  updatedAt: string;
}