import {
  Component,
  OnInit,
  inject, ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { StatCard } from '../../components/stat-card/stat-card';

import { HabitService } from '../../../../core/services/habit.service';
import { TaskService } from '../../../../core/services/task.service';
import { DiaryService } from '../../../../core/services/diary.service';


type ViewMode = 'week' | 'month' | 'year';


interface ActivityItem {
  date: Date;
  label: string;
  count: number;
  completed: boolean;
  items: any[];
  isFuture: boolean;
}


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    StatCard
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {

  private habitService = inject(HabitService);
  private taskService = inject(TaskService);
  private diaryService = inject(DiaryService);
  private cdr = inject(ChangeDetectorRef);


  // ============================================================
  // BASIC DATA
  // ============================================================

  today = new Date();

  habits: any[] = [];
  tasks: any[] = [];
  diaries: any[] = [];


  // ============================================================
  // TODAY
  // ============================================================

  completedTodayHabits = 0;
  totalHabits = 0;

  completedTodayTasks = 0;
  totalTodayTasks = 0;

  diaryWrittenToday = false;


  // ============================================================
  // HABIT ACTIVITY
  // ============================================================

  habitViewMode: ViewMode = 'week';

  habitPeriodDate = new Date();

  habitActivityData: ActivityItem[] = [];

  selectedHabitActivity: ActivityItem | null = null;

  maxHabitValue = 1;


  // ============================================================
  // TASK ACTIVITY
  // ============================================================

  taskViewMode: ViewMode = 'week';

  taskPeriodDate = new Date();

  taskActivityData: ActivityItem[] = [];

  selectedTaskActivity: ActivityItem | null = null;

  maxTaskValue = 1;
  habitloaded: boolean = false;
  taskloaded: boolean = false;

  // ============================================================
  // INIT
  // ============================================================

  async ngOnInit() {

    this.today = this.normalizeDate(new Date());

    this.habitPeriodDate = new Date(this.today);
    this.taskPeriodDate = new Date(this.today);

    await this.loadDashboard();
    this.cdr.detectChanges();
  }


  // ============================================================
  // LOAD DATA
  // ============================================================

  async loadDashboard() {

    this.habitService.getHabits().subscribe({
      next: (habits: any[]) => {

        this.habits = habits || [];

        this.totalHabits = this.habits.length;

        this.calculateTodayHabits();

        this.buildHabitActivityData();

      },
      error: (error) => {
        console.error('Failed to load habits:', error);
      }
    });


    this.taskService.getTasks().subscribe({
      next: (tasks: any[]) => {

        this.tasks = tasks || [];

        this.calculateTodayTasks();

        this.buildTaskActivityData();

      },
      error: (error) => {
        console.error('Failed to load tasks:', error);
      }
    });


    this.diaryService.getDiaries().subscribe({
      next: (diaries: any[]) => {

        this.diaries = diaries || [];

        this.calculateTodayDiary();

      },
      error: (error) => {
        console.error('Failed to load diaries:', error);
      }
    });

  }


  // ============================================================
  // TODAY - HABITS
  // ============================================================

  private calculateTodayHabits(): void {

    this.completedTodayHabits =
      this.habits.filter(habit =>
        this.habitHasCompletionOnDate(
          habit,
          this.today
        )
      ).length;
  }


  // ============================================================
  // TODAY - TASKS
  // ============================================================

  private calculateTodayTasks(): void {

    const todayTasks = this.tasks.filter(task =>
      this.isSameCalendarDay(
        new Date(task.dueDate),
        this.today
      )
    );

    this.totalTodayTasks = todayTasks.length;

    this.completedTodayTasks =
      todayTasks.filter(task => task.completed).length;

  }


  // ============================================================
  // TODAY - DIARY
  // ============================================================

  private calculateTodayDiary(): void {

    this.diaryWrittenToday = this.diaries.some(diary => {

      const diaryDate = diary.diaryDate
        ? new Date(diary.diaryDate)
        : new Date(diary.createdAt);

      return this.isSameCalendarDay(
        diaryDate,
        this.today
      );

    });

  }


  // ============================================================
  // HABIT ACTIVITY DATA
  // ============================================================

  private buildHabitActivityData(): void {

    const dates = this.getPeriodDates(
      this.habitViewMode,
      this.habitPeriodDate
    );

    this.habitActivityData = dates.map(date => {

      const items = this.habits.filter(habit =>
        this.habitHasCompletionOnDate(
          habit,
          date
        )
      );

      return {
        date,
        label: this.getActivityLabel(
          date,
          this.habitViewMode
        ),
        count: items.length,
        completed: items.length > 0,
        items,
        isFuture: date > this.today
      };

    });

    this.maxHabitValue = Math.max(
      1,
      ...this.habitActivityData.map(item => item.count)
    );

    this.selectedHabitActivity = null;
    this.habitloaded = true
    this.cdr.detectChanges();

  }


  // ============================================================
  // TASK ACTIVITY DATA
  // ============================================================

  private buildTaskActivityData(): void {

    const dates = this.getPeriodDates(
      this.taskViewMode,
      this.taskPeriodDate
    );

    this.taskActivityData = dates.map(date => {

      const items = this.tasks.filter(task =>
        task.completed === true &&
        task.completedAt &&
        this.isSameCalendarDay(
          new Date(task.completedAt),
          date
        )
      );

      return {
        date,
        label: this.getActivityLabel(
          date,
          this.taskViewMode
        ),
        count: items.length,
        completed: items.length > 0,
        items,
        isFuture: date > this.today
      };

    });

    this.maxTaskValue = Math.max(
      1,
      ...this.taskActivityData.map(item => item.count)
    );

    this.selectedTaskActivity = null;
    this.taskloaded = true;
    this.cdr.detectChanges();

  }


  // ============================================================
  // HABIT NAVIGATION
  // ============================================================

  previousHabitPeriod(): void {

    this.shiftHabitPeriod(-1);

  }


  nextHabitPeriod(): void {

    if (this.isCurrentHabitPeriod()) {
      return;
    }

    this.shiftHabitPeriod(1);

  }


  changeHabitView(mode: ViewMode): void {

    this.habitViewMode = mode;

    this.habitPeriodDate = new Date(this.today);

    this.buildHabitActivityData();

  }


  private shiftHabitPeriod(amount: number): void {

    if (this.habitViewMode === 'week') {

      this.habitPeriodDate = new Date(
        this.habitPeriodDate
      );

      this.habitPeriodDate.setDate(
        this.habitPeriodDate.getDate() + amount * 7
      );

    }

    else if (this.habitViewMode === 'month') {

      this.habitPeriodDate = new Date(
        this.habitPeriodDate.getFullYear(),
        this.habitPeriodDate.getMonth() + amount,
        1
      );

    }

    else {

      this.habitPeriodDate = new Date(
        this.habitPeriodDate.getFullYear() + amount,
        0,
        1
      );

    }

    this.buildHabitActivityData();

  }


  // ============================================================
  // TASK NAVIGATION
  // ============================================================

  previousTaskPeriod(): void {

    this.shiftTaskPeriod(-1);

  }


  nextTaskPeriod(): void {

    if (this.isCurrentTaskPeriod()) {
      return;
    }

    this.shiftTaskPeriod(1);

  }


  changeTaskView(mode: ViewMode): void {

    this.taskViewMode = mode;

    this.taskPeriodDate = new Date(this.today);

    this.buildTaskActivityData();

  }


  private shiftTaskPeriod(amount: number): void {

    if (this.taskViewMode === 'week') {

      this.taskPeriodDate = new Date(
        this.taskPeriodDate
      );

      this.taskPeriodDate.setDate(
        this.taskPeriodDate.getDate() + amount * 7
      );

    }

    else if (this.taskViewMode === 'month') {

      this.taskPeriodDate = new Date(
        this.taskPeriodDate.getFullYear(),
        this.taskPeriodDate.getMonth() + amount,
        1
      );

    }

    else {

      this.taskPeriodDate = new Date(
        this.taskPeriodDate.getFullYear() + amount,
        0,
        1
      );

    }

    this.buildTaskActivityData();

  }


  // ============================================================
  // PERIOD TITLES
  // ============================================================

  get habitPeriodTitle(): string {

    return this.getPeriodTitle(
      this.habitViewMode,
      this.habitPeriodDate
    );

  }


  get taskPeriodTitle(): string {

    return this.getPeriodTitle(
      this.taskViewMode,
      this.taskPeriodDate
    );

  }


  private getPeriodTitle(
    mode: ViewMode,
    date: Date
  ): string {

    if (mode === 'week') {

      const start = this.getStartOfWeek(date);

      const end = new Date(start);

      end.setDate(
        end.getDate() + 6
      );

      if (start.getFullYear() === end.getFullYear()) {

        if (start.getMonth() === end.getMonth()) {

          return `${start.toLocaleDateString(
            'en-US',
            { month: 'short' }
          )} ${start.getDate()} – ${end.getDate()}, ${end.getFullYear()}`;

        }

        return `${start.toLocaleDateString(
          'en-US',
          { month: 'short' }
        )} ${start.getDate()} – ${end.toLocaleDateString(
          'en-US',
          { month: 'short' }
        )} ${end.getDate()}, ${end.getFullYear()}`;

      }

      return `${start.toLocaleDateString(
        'en-US',
        { month: 'short', day: 'numeric', year: 'numeric' }
      )} – ${end.toLocaleDateString(
        'en-US',
        { month: 'short', day: 'numeric', year: 'numeric' }
      )}`;

    }


    if (mode === 'month') {

      return date.toLocaleDateString(
        'en-US',
        {
          month: 'long',
          year: 'numeric'
        }
      );

    }


    return date.getFullYear().toString();

  }


  // ============================================================
  // CURRENT PERIOD CHECKS
  // ============================================================

  isCurrentHabitPeriod(): boolean {

    return this.isCurrentPeriod(
      this.habitViewMode,
      this.habitPeriodDate
    );

  }


  isCurrentTaskPeriod(): boolean {

    return this.isCurrentPeriod(
      this.taskViewMode,
      this.taskPeriodDate
    );

  }


  private isCurrentPeriod(
    mode: ViewMode,
    date: Date
  ): boolean {

    const today = this.today;

    if (mode === 'week') {

      const start = this.getStartOfWeek(date);

      const end = new Date(start);

      end.setDate(
        end.getDate() + 6
      );

      return (
        today >= start &&
        today <= end
      );

    }


    if (mode === 'month') {

      return (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth()
      );

    }


    return date.getFullYear() === today.getFullYear();

  }


  // ============================================================
  // SELECTED ACTIVITY
  // ============================================================

  onHabitActivitySelected(
    item: ActivityItem
  ): void {

    this.selectedHabitActivity = item;

  }


  onTaskActivitySelected(
    item: ActivityItem
  ): void {

    this.selectedTaskActivity = item;

  }


  // ============================================================
  // PERIOD DATE GENERATION
  // ============================================================

  private getPeriodDates(
    mode: ViewMode,
    date: Date
  ): Date[] {

    if (mode === 'week') {

      const start = this.getStartOfWeek(date);

      return Array.from(
        { length: 7 },
        (_, index) => {

          const current = new Date(start);

          current.setDate(
            current.getDate() + index
          );

          return current;

        }
      );

    }


    if (mode === 'month') {

      const year = date.getFullYear();

      const month = date.getMonth();

      const numberOfDays =
        new Date(
          year,
          month + 1,
          0
        ).getDate();

      return Array.from(
        { length: numberOfDays },
        (_, index) =>
          new Date(
            year,
            month,
            index + 1
          )
      );

    }


    const year = date.getFullYear();

    const numberOfDays =
      new Date(
        year,
        11,
        31
      ).getDate() === 31 &&
      new Date(
        year,
        1,
        29
      ).getDate() === 29
        ? 366
        : 365;

    return Array.from(
      { length: numberOfDays },
      (_, index) =>
        new Date(
          year,
          0,
          index + 1
        )
    );

  }


  // ============================================================
  // LABELS
  // ============================================================

  private getActivityLabel(
    date: Date,
    mode: ViewMode
  ): string {

    if (mode === 'week') {

      return date.toLocaleDateString(
        'en-US',
        {
          weekday: 'short'
        }
      );

    }

    if (mode === 'month') {

      return date.getDate().toString();

    }

    return '';

  }


  // ============================================================
  // HABIT COMPLETION CHECK
  // ============================================================

  private habitHasCompletionOnDate(
    habit: any,
    date: Date
  ): boolean {

    if (
      !habit.completedHistory ||
      !Array.isArray(habit.completedHistory)
    ) {
      return false;
    }

    return habit.completedHistory.some(
      (entry: any) => {

        if (!entry.completedAt) {
          return false;
        }

        return this.isSameCalendarDay(
          new Date(entry.completedAt),
          date
        );

      }
    );

  }


  // ============================================================
  // DATE HELPERS
  // ============================================================

  private getStartOfWeek(
    date: Date
  ): Date {

    const result = this.normalizeDate(date);

    const day = result.getDay();

    const difference =
      day === 0
        ? -6
        : 1 - day;

    result.setDate(
      result.getDate() + difference
    );

    return result;

  }


  private normalizeDate(
    date: Date
  ): Date {

    const result = new Date(date);

    result.setHours(
      0,
      0,
      0,
      0
    );

    return result;

  }


  private isSameCalendarDay(
    first: Date,
    second: Date
  ): boolean {

    return (
      first.getFullYear() === second.getFullYear() &&
      first.getMonth() === second.getMonth() &&
      first.getDate() === second.getDate()
    );

  }

}