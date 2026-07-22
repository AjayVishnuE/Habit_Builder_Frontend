import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';

import { Habit } from '../../../../core/models/habit.model';
import { HabitService } from '../../../../core/services/habit.service';
import { StatCard } from '../../components/stat-card/stat-card';

@Component({
  selector: 'app-dashboard',
  imports: [
    StatCard, CommonModule,  BaseChartDirective,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.sass',
})
export class Dashboard {
  public totalHabits = 0;
  public completedToday = 0;
  public currentStreak = 0;
  public barChartData:any;
  habits: Habit[] = [];

  private habitService = inject(HabitService);
  private cdr = inject(ChangeDetectorRef);
  public barChartType: ChartType = 'bar';

  async ngOnInit(): Promise<void> {
    await this.loadDashboard();
  }

  async loadDashboard(): Promise<void> {
    try {
      const habits = await firstValueFrom(this.habitService.getHabits());
      this.habits = habits;
      this.totalHabits = habits.length;

      const today = new Date().toDateString();

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
}

