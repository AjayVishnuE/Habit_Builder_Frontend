export interface Profile {
  _id: string;
  name: string;
  email: string;
  profileImage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GeekStats {
  oldestHabit: {
    title: string;
    startedAt: string;
    durationDays: number;
  } | null;

  mostConsistentHabit: {
    title: string;
    frequency: 'Daily' | 'Weekly' | 'Monthly';
    completionRate: number;
    completions: number;
  } | null;

  longestMaintainedHabit: {
    title: string;
    durationDays: number;
    startedAt: string;
    latestCompletion: string;
  } | null;

  bestStreak: {
    title: string;
    days: number;
    startDate: string;
    endDate: string;
  } | null;

  mostCompletedHabit: {
    title: string;
    completions: number;
  } | null;

  mostActiveDay: {
    day: string;
    completions: number;
  } | null;
}

export interface ProfileSummary {
  totalHabits: number;
  totalCompletions: number;
  totalDiaries: number;
  totalTasks: number;
  completedTasks: number;
  totalNotes: number;
}

export interface ProfileStats {
  geekStats: GeekStats;
  summary: ProfileSummary;
}