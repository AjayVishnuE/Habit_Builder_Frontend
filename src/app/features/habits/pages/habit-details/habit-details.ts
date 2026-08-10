import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { Habit } from '../../../../core/models/habit.model';
import { HabitService } from '../../../../core/services/habit.service';
import { ProgressVisualization } from '../../components/progress-visualization/progress-visualization';

@Component({
    selector: 'app-habit-details',
    standalone: true,
    imports: [ CommonModule, RouterModule, MatButtonToggleModule, FormsModule, ProgressVisualization ],
    templateUrl: './habit-details.html',
    styleUrl: './habit-details.scss'
})
export class HabitDetails implements OnInit {

    private route = inject(ActivatedRoute);
    private habitService = inject(HabitService);
    private cdr = inject(ChangeDetectorRef);
    public totalCompletions = 0;
    public completionRate = 0;
    public averageDuration = 0;
    public mostCommonMood = '-';
    public lastCompleted = '';
    public habit?: Habit;
    public viewMode: 'week' | 'month' | 'year' = 'week';
    public currentDate = new Date();
    public visualizationData: any[] = [];
    public selectedEntry: any = null;
    public selectedDate = new Date();  

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (!id) {
            return;
        }
        this.habitService.getHabitById(id).subscribe({
            next: habit => {
                this.habit = habit;
                this.calculateInsights();
                this.generateVisualizationData();
                this.cdr.detectChanges();
            },
            error: err => console.error(err)
        });
    }

    onViewChanged(): void {
        this.selectedEntry = null;
        this.generateVisualizationData();
    }

    calculateInsights() {
        if (!this.habit) {
            return;
        }
        const history = this.habit.completedHistory;
        this.totalCompletions = history.length;
        if (!history.length) {
            return;
        }
        this.lastCompleted = history[history.length - 1].completedAt;
        const totalDuration = history.reduce( (sum, entry) => sum + (entry.duration || 0), 0 );
        this.averageDuration = Math.round(totalDuration / history.length);
        const moods: Record<string, number> = {};
        history.forEach(entry => {
            moods[entry.mood] =
            (moods[entry.mood] || 0) + 1;
        });
        this.mostCommonMood = Object.keys(moods).reduce((a, b) => moods[a] > moods[b] ? a : b );
        this.completionRate = this.calculateCompletionRate();
    }

    private calculateCompletionRate(): number {
        if (!this.habit) {
            return 0;
        }
        const created = new Date(this.habit.createdAt);
        const today = new Date();
        let expected = 0;
        switch (this.habit.frequency) {
            case 'Daily':
                expected = Math.floor( (today.getTime() - created.getTime()) / (1000 * 60 * 60 * 24) ) + 1;
                break;
            case 'Weekly':
                expected = Math.ceil( (today.getTime() - created.getTime()) / (1000 * 60 * 60 * 24 * 7) );
                break;
            case 'Monthly':
                expected = (today.getFullYear() - created.getFullYear()) * 12 + (today.getMonth() - created.getMonth()) + 1;
                break;
        }
        if (expected <= 0) {
            return 100;
        }
        return Math.round(
            this.totalCompletions * 100 / expected
        );
    }

    previousPeriod(): void {
        if (this.viewMode === 'week') {
        this.currentDate.setDate(this.currentDate.getDate() - 7);
        }
        else if (this.viewMode === 'month') {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        }
        else {
        this.currentDate.setFullYear(
            this.currentDate.getFullYear() - 1
        );
        }
        this.currentDate = new Date(this.currentDate);
        this.generateVisualizationData();
    }

    nextPeriod(): void {
        if (this.viewMode === 'week') {
        this.currentDate.setDate(this.currentDate.getDate() + 7);
        }
        else if (this.viewMode === 'month') {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        }
        else {
        this.currentDate.setFullYear(
            this.currentDate.getFullYear() + 1
        );
        }
        this.currentDate = new Date(this.currentDate);
        this.generateVisualizationData();
    }

    get periodTitle(): string {
        switch (this.viewMode) {
            case 'week':
                return this.getWeekRange();
            case 'month':
                return this.currentDate.toLocaleDateString( 'en-US', { month: 'long', year: 'numeric' } );
            case 'year':
                return this.currentDate.getFullYear().toString();
            default:
                return '';
        }
    }

    private getWeekRange(): string {
        const start = new Date(this.currentDate);
        const day = start.getDay();
        const diff = day === 0 ? -6 : 1 - day;
        start.setDate(start.getDate() + diff);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        return `${start.toLocaleDateString( 'en-US', { month: 'short', day: 'numeric' } )} - ${end.toLocaleDateString( 'en-US', { month: 'short', day: 'numeric' } )}`;
    }

    generateVisualizationData(): void {
        if (!this.habit) {
            this.visualizationData = [];
            return;
        }
        if (this.viewMode === 'week') {
            this.generateWeekData();
        }
        else if (this.viewMode === 'month') {
            this.generateMonthData();
        }
        else {
            this.generateYearData();
        }
    }

    private generateWeekData(): void {
        const start = this.getWeekStart(this.currentDate);
        // DAILY → 7 bars
        if (this.habit?.frequency === 'Daily') {
            this.visualizationData = [];
            for (let i = 0; i < 7; i++) {
                const date = new Date(start);
                date.setDate(start.getDate() + i);
                const entry = this.getCompletionForDate(date);
                this.visualizationData.push({
                    date,
                    label: date.toLocaleDateString('en-US', { weekday: 'short' }),
                    completed: !!entry,
                    mood: entry?.mood ?? null,
                    remark: entry?.remark ?? '',
                    duration: entry?.duration ?? 0,
                    completedAt: entry?.completedAt ?? null
                });
            }
            return;
        }
        // WEEKLY → maximum ONE bar
        if (this.habit?.frequency === 'Weekly') {
            const entry = this.getCompletionInRange( start, this.getWeekEnd(start) );
            this.visualizationData = entry ? [{
                date: new Date(entry.completedAt),
                label: 'Week',
                completed: true,
                mood: entry.mood,
                remark: entry.remark,
                duration: entry.duration,
                completedAt: entry.completedAt
                }]
            : [];
            return;
        }
        // MONTHLY → 0 or 1 bar
        if (this.habit?.frequency === 'Monthly') {
            const entry = this.getCompletionInRange( start, this.getWeekEnd(start) );
            this.visualizationData = entry  ? [{
                date: new Date(entry.completedAt),
                label: 'Week',
                completed: true,
                mood: entry.mood,
                remark: entry.remark,
                duration: entry.duration,
                completedAt: entry.completedAt
                }]
            : [];
        }
    }

    private generateMonthData(): void {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const numberOfDays = new Date(year, month + 1, 0).getDate();
        this.visualizationData = [];
        for (let day = 1; day <= numberOfDays; day++) {
            const date = new Date(year, month, day);
            const entry = this.getCompletionForDate(date);
            this.visualizationData.push({
                date,
                label: `${day}`,
                completed: !!entry,
                mood: entry?.mood ?? null,
                remark: entry?.remark ?? '',
                duration: entry?.duration ?? 0,
                completedAt: entry?.completedAt ?? null
            });
        }
    }

    private generateYearData(): void {
        const year = this.currentDate.getFullYear();
        const start = new Date(year, 0, 1);
        const end = new Date(year + 1, 0, 1);
        this.visualizationData = [];
        let current = new Date(start);
        while (current < end) {
            const date = new Date(current);
            const entry = this.getCompletionForDate(date);
            this.visualizationData.push({
                date,
                label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                completed: !!entry,
                mood: entry?.mood ?? null,
                remark: entry?.remark ?? '',
                duration: entry?.duration ?? 0,
                completedAt: entry?.completedAt ?? null
            });
            current.setDate(current.getDate() + 1);
        }
    }

    private getWeekStart(date: Date): Date {
        const result = new Date(date);
        const day = result.getDay();
        const diff = day === 0 ? -6 : 1 - day;
        result.setDate(result.getDate() + diff);
        result.setHours(0, 0, 0, 0);
        return result;
    }

    private getWeekEnd(date: Date): Date {
        const end = new Date(date);
        end.setDate(end.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        return end;
    }

    private getCompletionForDate(date: Date): any | null {
        const target = new Date(date);
        target.setHours(0, 0, 0, 0);
        const nextDay = new Date(target);
        nextDay.setDate(nextDay.getDate() + 1);
        return this.habit?.completedHistory.find(entry => {
            const completedAt = new Date(entry.completedAt);
            return ( completedAt >= target && completedAt < nextDay );
        }) ?? null;
    }

    private getCompletionInRange( start: Date, end: Date ): any | null {
        return this.habit?.completedHistory.find(entry => {
            const completedAt = new Date(entry.completedAt);
            return ( completedAt >= start && completedAt <= end );
        }) ?? null;
    }
}