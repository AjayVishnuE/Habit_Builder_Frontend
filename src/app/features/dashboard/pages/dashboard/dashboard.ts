import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { MatCardModule } from '@angular/material/card';
import { ChartConfiguration, ChartType } from 'chart.js';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';

import { Habit } from '../../../../core/models/habit.model';
import { HabitService } from '../../../../core/services/habit.service';
import { StatCard } from '../../components/stat-card/stat-card';
import { calculateLongestStreak, calculateOverallStreak } from '../../../../core/utils/streak.util';

@Component({
  selector: 'app-dashboard',
  imports: [ StatCard, CommonModule,  BaseChartDirective, MatCardModule, MatProgressBarModule, MatIconModule ],
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
  public isLoading = true;

  private habitService = inject(HabitService);
  private cdr = inject(ChangeDetectorRef);
  public barChartType: 'bar' = 'bar';

  async ngOnInit(): Promise<void> {
    this.isLoading = true;
    try {
      await this.loadDashboard();
      await this.calculateCompletionPercentage();
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }
  async loadDashboard(): Promise<void> {
    try {
      const habits = await firstValueFrom(this.habitService.getHabits());
      this.habits = habits.map(habit => ({
        ...habit,
        longestStreak: calculateLongestStreak( habit.completedHistory, habit.frequency ),
      }));   
      this.totalHabits = habits.length;

      const today = new Date().toDateString();
      this.currentStreak = calculateOverallStreak(this.habits);      
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
        data: values,
        backgroundColor: 'rgba(91, 91, 214, 0.78)',
        hoverBackgroundColor: 'rgba(91, 91, 214, 1)',
        borderRadius: 8,
        borderSkipped: false,
        barPercentage: 0.58,
        categoryPercentage: 0.72
      }
    ]
  };
  }

  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 700,
      easing: 'easeOutQuart'
    },
    interaction: {
      intersect: false,
      mode: 'index'
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(20, 20, 25, 0.92)',
        padding: 12,
        cornerRadius: 10,
        titleFont: {
          size: 12,
          weight: 600
        },
        bodyFont: {
          size: 13
        },
        displayColors: false,
        callbacks: {
          label: (context) => {
            return ` ${context.parsed.y} completed`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        border: {
          display: false
        },
        ticks: {
          color: '#85858d',
          font: {
            size: 12,
            weight: 500
          }
        }
      },
      y: {
        beginAtZero: true,
        border: {
          display: false,
          dash: [4, 4]
        },
        grid: {
          color: 'rgba(128, 128, 128, 0.12)',
          drawTicks: false
        },
        ticks: {
          color: '#85858d',
          padding: 10,
          precision: 0,
          font: {
            size: 11
          }
        }
      }
    },
    elements: {
      bar: {
        borderRadius: 8,
        borderSkipped: false
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

