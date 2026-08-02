import { Habit } from '../models/habit.model';
import { ActivityPoint } from '../models/activity-chart.model';

export function buildDailyChart( habit: Habit, view: 'week' | 'month' ): ActivityPoint[] {
    return [];
}

export function buildWeeklyChart( habit: Habit ): ActivityPoint[] {
    return [];
}

export function buildMonthlyChart( habit: Habit ): ActivityPoint[] {
    return [];
}