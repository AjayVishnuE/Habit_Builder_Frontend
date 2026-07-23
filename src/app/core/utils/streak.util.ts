export function calculateCurrentStreak(completedDates: string[]): number {
    if (!completedDates.length)
        return 0;
    const dates = completedDates.map(d => new Date(d)).sort((a, b) => b.getTime() - a.getTime());
    let streak = 0;
    let current = new Date();
    current.setHours(0,0,0,0);

    for (const date of dates) {
        date.setHours(0,0,0,0);
        if (date.getTime() === current.getTime()) {
            streak++;
            current.setDate(current.getDate() - 1);
        }
        else if (date.getTime() < current.getTime()) {
            break;
        }
    }
    return streak;
}