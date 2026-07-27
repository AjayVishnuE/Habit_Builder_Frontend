import { CompletedHistory } from '../models/habit.model';
export function calculateCurrentStreak(completedHistory: CompletedHistory[]): number {
    if (!completedHistory.length) {
        return 0;
    }
    const dates = completedHistory
        .map(entry => new Date(entry.completedAt))
        .sort((a, b) => b.getTime() - a.getTime());
    let streak = 0;
    let current = new Date();
    current.setHours(0,0,0,0);
    for (const date of dates) {
        date.setHours(0,0,0,0);
        if (date.getTime() === current.getTime()) {
            streak++;
            current.setDate(current.getDate() - 1);
        } else if (date.getTime() < current.getTime()) {
            break;
        }
    }
    return streak;
}

export function calculateLongestStreak(completedHistory: CompletedHistory[]): number {
    if (!completedHistory.length) {
        return 0;
    }
    const dates = completedHistory
        .map(entry => {
            const d = new Date(entry.completedAt);
            d.setHours(0,0,0,0);
            return d;
        })
        .sort((a,b)=>a.getTime()-b.getTime());
    let longest = 1;
    let current = 1;
    for(let i=1;i<dates.length;i++){
        const previous = dates[i-1];
        const today = dates[i];
        const diff =
            (today.getTime()-previous.getTime()) /
            (1000*60*60*24);
        if(diff===1){
            current++;
        }else if(diff>1){
            current=1;
        }
        longest=Math.max(longest,current);

    }

    return longest;

}