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
        longestStreak: calculateLongestStreak(habit.completedDates)
      }));   
      this.totalHabits = habits.length;

      const today = new Date().toDateString();
      this.currentStreak = Math.max(...this.habits.map(h => h.longestStreak ?? 0), 0 );
      
      this.completedToday = habits.filter(habit =>
        habit.completedDates.some(date =>
          new Date(date).toDateString() === today
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
        habit.completedDates.forEach(date => {
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

  async calculateCompletionPercentage() {
    const today = new Date();
    const dailyHabits = this.habits.filter(h => h.frequency === 'Daily');
    const weeklyHabits = this.habits.filter(h => h.frequency === 'Weekly');
    const monthlyHabits = this.habits.filter(h => h.frequency === 'Monthly');
    const completedDaily = dailyHabits.filter(h =>
      this.isCompleted(h, today)
    ).length;
    const completedWeekly = weeklyHabits.filter(h =>
      this.isCompleted(h, today)
    ).length;
    const completedMonthly = monthlyHabits.filter(h =>
      this.isCompleted(h, today)
    ).length;
    this.dailyPercentage =
      dailyHabits.length
        ? Math.round((completedDaily / dailyHabits.length) * 100)
        : 0;
    this.weeklyPercentage =
      weeklyHabits.length
        ? Math.round((completedWeekly / weeklyHabits.length) * 100)
        : 0;
    this.monthlyPercentage =
      monthlyHabits.length
        ? Math.round((completedMonthly / monthlyHabits.length) * 100)
        : 0;
    this.cdr.detectChanges();
  }

  isCompleted(habit: Habit, today: Date): boolean {
    if (!habit.completedDates.length) {
      return false;
    }
    const lastCompleted = new Date(
      habit.completedDates[habit.completedDates.length - 1]
    );
    switch (habit.frequency) {
      case 'Daily':
        return lastCompleted.toDateString() === today.toDateString();
      case 'Weekly':
        return this.isSameWeek(lastCompleted, today);
      case 'Monthly':
        return (
          lastCompleted.getMonth() === today.getMonth() &&
          lastCompleted.getFullYear() === today.getFullYear()
        );
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
      startOfWeek(date1).getTime() ===
      startOfWeek(date2).getTime()
    );

  }
}

