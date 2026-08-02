export interface ActivityPoint {
    label: string;
    completed: boolean;
    duration: number;
    mood: string;
    remark: string;
    completedAt?: Date;
}