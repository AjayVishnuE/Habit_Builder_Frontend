export interface Habit {
  _id: string;
  title: string;
  description: string;
  frequency: string;
  completedHistory: CompletedHistory[];
  createdAt: string;
  updatedAt: string;
  currentStreak?: number;
  longestStreak?: number;
}

export interface CompletedHistory {
  completedAt: string;
  remark: string;
  mood: string;
  duration: number;
}