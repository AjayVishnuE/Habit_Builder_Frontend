
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Habit } from '../../../../core/models/habit.model';
import { HabitService } from '../../../../core/services/habit.service';
import { ProgressVisualization } from '../../components/progress-visualization/progress-visualization';

@Component({
    selector: 'app-habit-details',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonToggleModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        ProgressVisualization
    ],
    templateUrl: './habit-details.html',
    styleUrl: './habit-details.scss'
})
export class HabitDetails implements OnInit {
    private route = inject(ActivatedRoute);
    private habitService = inject(HabitService);
    private cdr = inject(ChangeDetectorRef);
    private fb = inject(FormBuilder);

    public totalCompletions = 0;
    public completionRate = 0;
    public averageDuration = 0;
    public mostCommonMood = '-';
    public lastCompleted = '';
    public habit?: Habit;
    public completionError = '';
    public viewMode: 'week' | 'month' | 'year' = 'week';
    public currentDate = new Date();
    public visualizationData: any[] = [];
    public selectedEntry: any = null;
    public selectedDate = new Date();
    public isEditingEntry = false;
    public isCreatingEntry = false;
    public isSavingCompletion = false;
    public periodAlreadyCompleted = false;
    public periodExistingEntry: any = null;

    public completionEditForm = this.fb.nonNullable.group({
        mood: ['Good', Validators.required],
        duration: [0, [Validators.required, Validators.min(0)]],
        remark: ['', Validators.maxLength(250)]
    });

    ngOnInit(): void {
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

    selectEntry(entry: any): void {
        this.completionError = '';
        this.selectedEntry = entry;
        this.isEditingEntry = false;
        this.isCreatingEntry = false;
        this.isSavingCompletion = false;
        this.periodAlreadyCompleted = false;
        this.periodExistingEntry = null;

        if (entry && !entry.completed) {
            this.checkExistingPeriodCompletion(entry.date);
        }

        this.cdr.detectChanges();
    }

    private checkExistingPeriodCompletion(date: Date): void {
        if (!this.habit) {
            return;
        }

        const existing = this.getCompletionForPeriod(date);

        if (existing) {
            const selectedId = this.selectedEntry?.completionId;
            const existingId = existing._id ? String(existing._id) : null;

            if (selectedId && existingId && String(selectedId) === existingId) {
                return;
            }

            this.periodAlreadyCompleted = true;
            this.periodExistingEntry = existing;
        }
    }

    private getCompletionForPeriod(date: Date): any | null {
        if (!this.habit) {
            return null;
        }

        switch (this.habit.frequency) {
            case 'Daily':
                return this.getCompletionForDate(date);

            case 'Weekly': {
                const start = this.getWeekStart(date);
                const end = this.getWeekEnd(start);
                return this.getCompletionInRange(start, end);
            }

            case 'Monthly':
                return (
                    this.habit.completedHistory.find(entry => {
                        const completedAt = new Date(entry.completedAt);
                        return completedAt.getFullYear() === date.getFullYear() &&
                            completedAt.getMonth() === date.getMonth();
                    }) ?? null
                );

            default:
                return null;
        }
    }

    startEditingEntry(): void {
        if (!this.selectedEntry || !this.selectedEntry.completed || !this.selectedEntry.completionId) {
            return;
        }

        this.completionEditForm.patchValue({
            mood: this.selectedEntry.mood || 'Good',
            duration: this.selectedEntry.duration || 0,
            remark: this.selectedEntry.remark || ''
        });

        this.isCreatingEntry = false;
        this.isEditingEntry = true;
        this.cdr.detectChanges();
    }

    cancelEditingEntry(): void {
        this.isEditingEntry = false;
        this.isSavingCompletion = false;
        this.resetCompletionForm(this.selectedEntry);
        this.cdr.detectChanges();
    }

    saveCompletion(): void {
        if (!this.habit || !this.selectedEntry || this.completionEditForm.invalid) {
            return;
        }

        const habitId = this.habit._id;
        const completionId = this.selectedEntry.completionId;

        if (!habitId || !completionId) {
            console.error('Missing habit ID or completion ID');
            return;
        }

        this.isSavingCompletion = true;

        const formValue = this.completionEditForm.getRawValue();

        this.habitService.updateCompletion(habitId, completionId, {
            mood: formValue.mood,
            duration: Number(formValue.duration),
            remark: formValue.remark.trim()
        }).subscribe({
            next: updatedHabit => {
                this.habit = updatedHabit;
                this.calculateInsights();
                this.generateVisualizationData();

                const updatedEntry = this.visualizationData.find(
                    entry => entry.completionId === completionId
                );

                this.selectedEntry = updatedEntry || null;
                this.isEditingEntry = false;
                this.isCreatingEntry = false;
                this.isSavingCompletion = false;
                this.cdr.detectChanges();
            },
            error: err => {
                console.error('Failed to update completion:', err);
                this.isSavingCompletion = false;
                this.cdr.detectChanges();
            }
        });
    }

    startCreatingEntry(): void {
        if (!this.selectedEntry || this.selectedEntry.completed || this.periodAlreadyCompleted) {
            return;
        }

        this.resetCompletionForm();
        this.isEditingEntry = false;
        this.isCreatingEntry = true;
        this.cdr.detectChanges();
    }

    cancelCreatingEntry(): void {
        this.completionError = '';
        this.isCreatingEntry = false;
        this.isSavingCompletion = false;
        this.resetCompletionForm();
        this.cdr.detectChanges();
    }

    saveHistoricalCompletion(): void {
        if (
            !this.habit ||
            !this.selectedEntry ||
            this.selectedEntry.completed ||
            this.periodAlreadyCompleted ||
            this.completionEditForm.invalid
        ) {
            return;
        }

        const habitId = this.habit._id;

        if (!habitId) {
            return;
        }

        const selectedDate = new Date(this.selectedEntry.date);
        const now = new Date();

        if (selectedDate > now) {
            this.completionError = 'Unable to record this completion. Please try again';
            return;
        }

        this.isSavingCompletion = true;

        const formValue = this.completionEditForm.getRawValue();

        this.habitService.completeHabit(habitId, {
            completedAt: this.getCompletionDateForApi(selectedDate),
            mood: formValue.mood,
            duration: Number(formValue.duration),
            remark: formValue.remark.trim()
        }).subscribe({
            next: updatedHabit => {
                this.habit = updatedHabit;
                this.calculateInsights();
                this.generateVisualizationData();

                const newEntry = this.findEntryAfterHistoricalSave(selectedDate);

                this.selectedEntry = newEntry || null;
                this.isCreatingEntry = false;
                this.isEditingEntry = false;
                this.isSavingCompletion = false;
                this.periodAlreadyCompleted = false;
                this.periodExistingEntry = null;
                this.resetCompletionForm(this.selectedEntry);
                this.cdr.detectChanges();
            },
            error: err => {
                console.error('Failed to create historical completion:', err);
                this.isSavingCompletion = false;
                this.cdr.detectChanges();
            }
        });
    }

    private getCompletionDateForApi(date: Date): string {
        const localDate = new Date(date);
        localDate.setHours(12, 0, 0, 0);
        return localDate.toISOString();
    }

    private findEntryAfterHistoricalSave(selectedDate: Date): any | null {
        const visualizationEntry = this.visualizationData.find(entry => {
            if (!entry.completed) {
                return false;
            }

            return this.isSameRelevantPeriod(entry.date, selectedDate);
        });

        if (visualizationEntry) {
            return visualizationEntry;
        }

        const rawEntry = this.getCompletionForPeriod(selectedDate);

        if (!rawEntry) {
            return null;
        }

        return {
            date: new Date(rawEntry.completedAt),
            label: 'Completed',
            completed: true,
            completionId: rawEntry._id ?? null,
            mood: rawEntry.mood ?? null,
            remark: rawEntry.remark ?? '',
            duration: rawEntry.duration ?? 0,
            completedAt: rawEntry.completedAt
        };
    }

    private isSameRelevantPeriod(first: Date, second: Date): boolean {
        if (!this.habit) {
            return false;
        }

        switch (this.habit.frequency) {
            case 'Daily':
                return first.getFullYear() === second.getFullYear() &&
                    first.getMonth() === second.getMonth() &&
                    first.getDate() === second.getDate();

            case 'Weekly':
                return this.getWeekStart(first).getTime() === this.getWeekStart(second).getTime();

            case 'Monthly':
                return first.getFullYear() === second.getFullYear() &&
                    first.getMonth() === second.getMonth();

            default:
                return false;
        }
    }

    selectEntryForExistingPeriod(): void {
        if (!this.periodExistingEntry) {
            return;
        }

        const existing = this.periodExistingEntry;

        const matchingEntry = this.visualizationData.find(
            entry => entry.completionId &&
                existing._id &&
                String(entry.completionId) === String(existing._id)
        );

        if (matchingEntry) {
            this.selectedEntry = matchingEntry;
            this.periodAlreadyCompleted = false;
            this.periodExistingEntry = null;
            return;
        }

        this.selectedEntry = {
            date: new Date(existing.completedAt),
            label: 'Completed',
            completed: true,
            completionId: existing._id ?? null,
            mood: existing.mood ?? null,
            remark: existing.remark ?? '',
            duration: existing.duration ?? 0,
            completedAt: existing.completedAt
        };

        this.periodAlreadyCompleted = false;
        this.periodExistingEntry = null;
    }

    private resetCompletionForm(entry?: any): void {
        this.completionEditForm.reset({
            mood: entry?.mood || 'Good',
            duration: entry?.duration || 0,
            remark: entry?.remark || ''
        });
    }

    onViewChanged(): void {
        this.selectedEntry = null;
        this.isEditingEntry = false;
        this.isCreatingEntry = false;
        this.periodAlreadyCompleted = false;
        this.periodExistingEntry = null;
        this.generateVisualizationData();
    }

    calculateInsights(): void {
        if (!this.habit) {
            return;
        }

        const history = this.habit.completedHistory;
        this.totalCompletions = history.length;

        if (!history.length) {
            this.lastCompleted = '';
            this.averageDuration = 0;
            this.mostCommonMood = '-';
            this.completionRate = 0;
            return;
        }

        this.lastCompleted = history[history.length - 1].completedAt;

        const totalDuration = history.reduce(
            (sum, entry) => sum + (entry.duration || 0),
            0
        );

        this.averageDuration = Math.round(totalDuration / history.length);

        const moods: Record<string, number> = {};

        history.forEach(entry => {
            moods[entry.mood] = (moods[entry.mood] || 0) + 1;
        });

        this.mostCommonMood = Object.keys(moods).reduce(
            (a, b) => moods[a] > moods[b] ? a : b
        );

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
                expected = Math.floor(
                    (today.getTime() - created.getTime()) /
                    (1000 * 60 * 60 * 24)
                ) + 1;
                break;

            case 'Weekly':
                expected = Math.ceil(
                    (today.getTime() - created.getTime()) /
                    (1000 * 60 * 60 * 24 * 7)
                );
                break;

            case 'Monthly':
                expected =
                    (today.getFullYear() - created.getFullYear()) * 12 +
                    (today.getMonth() - created.getMonth()) + 1;
                break;
        }

        if (expected <= 0) {
            return 100;
        }

        return Math.round(this.totalCompletions * 100 / expected);
    }

    previousPeriod(): void {
        if (this.viewMode === 'week') {
            this.currentDate.setDate(this.currentDate.getDate() - 7);
        } else if (this.viewMode === 'month') {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        } else {
            this.currentDate.setFullYear(this.currentDate.getFullYear() - 1);
        }

        this.currentDate = new Date(this.currentDate);
        this.clearSelection();
        this.generateVisualizationData();
    }

    nextPeriod(): void {
        if (this.viewMode === 'week') {
            this.currentDate.setDate(this.currentDate.getDate() + 7);
        } else if (this.viewMode === 'month') {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        } else {
            this.currentDate.setFullYear(this.currentDate.getFullYear() + 1);
        }

        this.currentDate = new Date(this.currentDate);
        this.clearSelection();
        this.generateVisualizationData();
    }

    private clearSelection(): void {
        this.selectedEntry = null;
        this.isEditingEntry = false;
        this.isCreatingEntry = false;
        this.periodAlreadyCompleted = false;
        this.periodExistingEntry = null;
    }

    get periodTitle(): string {
        switch (this.viewMode) {
            case 'week':
                return this.getWeekRange();

            case 'month':
                return this.currentDate.toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric'
                });

            case 'year':
                return this.currentDate.getFullYear().toString();

            default:
                return '';
        }
    }

    private getWeekRange(): string {
        const start = this.getWeekStart(this.currentDate);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);

        return `${start.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        })} - ${end.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        })}`;
    }

    generateVisualizationData(): void {
        if (!this.habit) {
            this.visualizationData = [];
            return;
        }

        if (this.viewMode === 'week') {
            this.generateWeekData();
        } else if (this.viewMode === 'month') {
            this.generateMonthData();
        } else {
            this.generateYearData();
        }
    }

    private generateWeekData(): void {
        const start = this.getWeekStart(this.currentDate);

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
                    completionId: entry?._id ?? null,
                    mood: entry?.mood ?? null,
                    remark: entry?.remark ?? '',
                    duration: entry?.duration ?? 0,
                    completedAt: entry?.completedAt ?? null
                });
            }

            return;
        }

        if (this.habit?.frequency === 'Weekly') {
            const entry = this.getCompletionInRange(start, this.getWeekEnd(start));

            this.visualizationData = [{
                date: entry ? new Date(entry.completedAt) : new Date(start),
                label: 'Week',
                completed: !!entry,
                completionId: entry?._id ?? null,
                mood: entry?.mood ?? null,
                remark: entry?.remark ?? '',
                duration: entry?.duration ?? 0,
                completedAt: entry?.completedAt ?? null
            }];

            return;
        }

        if (this.habit?.frequency === 'Monthly') {
            const entry = this.getCompletionInRange(start, this.getWeekEnd(start));

            this.visualizationData = entry ? [{
                date: new Date(entry.completedAt),
                label: 'Week',
                completed: true,
                completionId: entry._id ?? null,
                mood: entry.mood,
                remark: entry.remark,
                duration: entry.duration,
                completedAt: entry.completedAt
            }] : [];
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
                completionId: entry?._id ?? null,
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
                label: date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                }),
                completed: !!entry,
                completionId: entry?._id ?? null,
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
            return completedAt >= target && completedAt < nextDay;
        }) ?? null;
    }

    private getCompletionInRange(start: Date, end: Date): any | null {
        return this.habit?.completedHistory.find(entry => {
            const completedAt = new Date(entry.completedAt);
            return completedAt >= start && completedAt <= end;
        }) ?? null;
    }
}

