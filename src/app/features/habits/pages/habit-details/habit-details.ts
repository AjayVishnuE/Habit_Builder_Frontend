import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { Habit } from '../../../../core/models/habit.model';
import { HabitService } from '../../../../core/services/habit.service';
import { ActivityChart } from '../../components/activity-chart/activity-chart';
@Component({
    selector: 'app-habit-details',
    standalone: true,
    imports: [ CommonModule, RouterModule, ActivityChart, MatButtonToggleModule, FormsModule ],
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

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (!id) {
            return;
        }
        this.habitService.getHabitById(id).subscribe({
            next: habit => {
                this.habit = habit;
                this.calculateInsights();
                this.cdr.detectChanges();
            },
            error: err => console.error(err)
        });
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

    previousPeriod() {
        switch (this.viewMode) {
            case 'week':
                this.currentDate.setDate(this.currentDate.getDate() - 7);
                break;
            case 'month':
                this.currentDate.setMonth(this.currentDate.getMonth() - 1);
                break;
            case 'year':
                this.currentDate.setFullYear(this.currentDate.getFullYear() - 1);
                break;
        }
    }

    nextPeriod() {
        switch (this.viewMode) {
            case 'week':
                this.currentDate.setDate(this.currentDate.getDate() + 7);
                break;
            case 'month':
                this.currentDate.setMonth(this.currentDate.getMonth() + 1);
                break;
            case 'year':
                this.currentDate.setFullYear(this.currentDate.getFullYear() + 1);
                break;
        }
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
}