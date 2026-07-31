import { CompletedHistory } from '../models/habit.model';

function isSameWeek(date1: Date, date2: Date): boolean {
    const startOfWeek = (date: Date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = day === 0 ? -6 : 1 - day;
        d.setDate(d.getDate() + diff);
        d.setHours(0,0,0,0);
        return d;
    };
    return (
        startOfWeek(date1).getTime() === startOfWeek(date2).getTime()
    );
}

function moveBack(date: Date, frequency: string): Date {
    const d = new Date(date);
    switch (frequency) {
        case 'Weekly':
            d.setDate(d.getDate() - 7);
            break;
        case 'Monthly':
            d.setMonth(d.getMonth() - 1);
            break;
        default:
            d.setDate(d.getDate() - 1);
    }
    return d;
}

function matchesPeriod( date: Date, expected: Date, frequency: string ): boolean {
    switch (frequency) {
        case 'Weekly':
            return isSameWeek(date, expected);
        case 'Monthly':
            return isSameMonth(date, expected);
        default:
            return date.getTime() === expected.getTime();
    }
}

function isSameMonth(date1: Date, date2: Date): boolean {
    return (
        date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear()
    );
}

export function calculateCurrentStreak( completedHistory: CompletedHistory[], frequency: string ): number {
    if (!completedHistory || completedHistory.length === 0) {
        return 0;
    }
    const dates = completedHistory.map(entry => {
        const d = new Date(entry.completedAt);
        d.setHours(0, 0, 0, 0);
        return d;
    }).sort((a, b) => b.getTime() - a.getTime());
    let expected = new Date();
    expected.setHours(0, 0, 0, 0);
    if (!matchesPeriod(dates[0], expected, frequency)) {
        expected = moveBack(expected, frequency);
    }
    let streak = 0;
    for (const date of dates) {
        if (matchesPeriod(date, expected, frequency)) {
            streak++;
            expected = moveBack(expected, frequency);
        } else {
            break;
        }
    }
    return streak;
}

export function calculateLongestStreak( completedHistory: CompletedHistory[], frequency: string ): number {
    if (!completedHistory || completedHistory.length === 0) {
        return 0;
    }
    const dates = completedHistory.map(entry => {
        const d = new Date(entry.completedAt);
        d.setHours(0, 0, 0, 0);
        return d;
    }).sort((a, b) => a.getTime() - b.getTime());
    let longest = 1;
    let current = 1;
    for (let i = 1; i < dates.length; i++) {
        const expected = moveBack(dates[i], frequency);
        if (matchesPeriod(dates[i - 1], expected, frequency)) {
            current++;
        } else {
            current = 1;
        }
        longest = Math.max(longest, current);
    }
    return longest;
}

export function calculateOverallStreak( habits: { completedHistory: { completedAt: string }[] }[] ): number {
    const completedDays = new Set<string>();
    habits.forEach(habit => {
        habit.completedHistory?.forEach(entry => {
            const date = new Date(entry.completedAt);
            date.setHours(0, 0, 0, 0);
            completedDays.add(date.toDateString());
        });
    });
    if (completedDays.size === 0) {
        return 0;
    }
    let streak = 0;
    const current = new Date();
    current.setHours(0, 0, 0, 0);
    if (!completedDays.has(current.toDateString())) {
        current.setDate(current.getDate() - 1);
    }
    while (completedDays.has(current.toDateString())) {
        streak++;
        current.setDate(current.getDate() - 1);
    }
    return streak;
}