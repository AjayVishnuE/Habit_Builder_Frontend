import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { MatCardModule } from '@angular/material/card';
import { ChartConfiguration, ChartType } from 'chart.js';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { Habit } from '../../../../core/models/habit.model';
import { HabitService } from '../../../../core/services/habit.service';
import { StatCard } from '../../components/stat-card/stat-card';
import { calculateLongestStreak } from '../../../../core/utils/streak.util';

@Component({
  selector: 'app-dashboard',
  imports: [
    StatCard, CommonModule,  BaseChartDirective, MatCardModule, MatProgressBarModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  public totalHabits = 0;
  public completedToday = 0;
  public currentStreak = 0;
  public barChartData:any;
  public dailyPercentage = 0;
  public weeklyPercentage = 0;
  public monthlyPercentage = 0;
  public habits: Habit[] = [];

  private habitService = inject(HabitService);
  private cdr = inject(ChangeDetectorRef);
  public barChartType: ChartType = 'bar';

  async ngOnInit(): Promise<void> {
    await this.loadDashboard();
    await this.calculateCompletionPercentage();
  }

  async loadDashboard(): Promise<void> {
    try {
      const habits = await firstValueFrom(this.habitService.getHabits());
      this.habits = habits.map(habit => ({
        ...habit,
        longestStreak: calculateLongestStreak(habit.completedHistory)      
      }));   
      this.totalHabits = habits.length;

      const today = new Date().toDateString();
      this.currentStreak = Math.max(...this.habits.map(h => h.longestStreak ?? 0), 0 );
      
      this.completedToday = habits.filter(habit =>
        habit.completedHistory.some(entry =>
            new Date(entry.completedAt).toDateString() === today
        )
      ).length;
      await this.loadWeeklyChart();
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  }

  async loadWeeklyChart() {
    const labels: string[] = [];
    const values: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      labels.push(
        day.toLocaleDateString('en-US', { weekday: 'short' })
      );
      let count = 0;
      this.habits.forEach(habit => {
        habit.completedHistory.forEach(entry => {
          const date = entry.completedAt;
          if (
            new Date(date).toDateString() ===
            day.toDateString()
          ) {
            count++;
          }

        });
      });
      values.push(count);
    }
    this.barChartData = {
      labels,
      datasets: [
        {
          label: 'Completed Habits',
          data: values
        }
      ]
    };
  }

  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true
      }
    }
  };

  calculateCompletionPercentage() {
      const today = new Date();
      const dailyHabits = this.habits.filter(h => h.frequency === 'Daily');
      const weeklyHabits = this.habits.filter(h => h.frequency === 'Weekly');
      const monthlyHabits = this.habits.filter(h => h.frequency === 'Monthly');

      const completedDaily = dailyHabits.filter(h => this.isCompleted(h, today)).length;
      const completedWeekly = weeklyHabits.filter(h => this.isCompleted(h, today)).length;
      const completedMonthly = monthlyHabits.filter(h => this.isCompleted(h, today)).length;

      this.dailyPercentage = dailyHabits.length ? Math.round(completedDaily * 100 / dailyHabits.length) : 0;
      this.weeklyPercentage = weeklyHabits.length ? Math.round(completedWeekly * 100 / weeklyHabits.length) : 0;
      this.monthlyPercentage = monthlyHabits.length ? Math.round(completedMonthly * 100 / monthlyHabits.length) : 0;

      this.cdr.detectChanges();
  }

  isCompleted(habit: Habit, today: Date): boolean {
    switch (habit.frequency) {
      case 'Daily':
        return habit.completedHistory.some(entry =>
          new Date(entry.completedAt).toDateString() === today.toDateString()
        );
      case 'Weekly':
        return habit.completedHistory.some(entry =>
          this.isSameWeek(new Date(entry.completedAt), today)
        );
      case 'Monthly':
        return habit.completedHistory.some(entry => {
          const completed = new Date(entry.completedAt);
          return (
            completed.getMonth() === today.getMonth() &&
            completed.getFullYear() === today.getFullYear()
          );
        });
      default:
        return false;
    }
  }

  private isSameWeek(date1: Date, date2: Date): boolean {
    const startOfWeek = (date: Date) => {
      const d = new Date(date);
      const day = d.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      d.setDate(d.getDate() + diff);
      d.setHours(0, 0, 0, 0);
      return d;
    };
    return (
      startOfWeek(date1).getTime() === startOfWeek(date2).getTime()
    );
  }
}

