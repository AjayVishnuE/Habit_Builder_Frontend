import { Habit } from '../models/habit.model';
import { ActivityPoint } from '../models/activity-chart.model';

export function buildDailyChart( habit: Habit, view: 'week' | 'month' ): ActivityPoint[] {
    const points: ActivityPoint[] = [];
    if (view !== 'week') {
        return points;
    }
    for (let i = 6; i >= 0; i--) {
        const day = new Date();
        day.setHours(0,0,0,0);
        day.setDate(day.getDate() - i);
        const history = habit.completedHistory.find(entry => {
            const completed = new Date(entry.completedAt);
            completed.setHours(0,0,0,0);
            return completed.getTime() === day.getTime();
        });
        points.push({ label: day.toLocaleDateString( 'en-US', { weekday: 'short' } ),
            completed: !!history,
            duration: history?.duration ?? 0,
            mood: history?.mood ?? '',
            remark: history?.remark ?? '',
            completedAt: history ? new Date(history.completedAt) : undefined
        });
    }
    return points;
}

export function buildWeeklyChart( habit: Habit ): ActivityPoint[] {
    return [];
}

export function buildMonthlyChart( habit: Habit ): ActivityPoint[] {
    return [];
}