import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';

import { HabitService } from '../../../../core/services/habit.service';
import { StatCard } from '../../components/stat-card/stat-card';

@Component({
  selector: 'app-dashboard',
  imports: [
    StatCard, CommonModule
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.sass',
})
export class Dashboard {
  public totalHabits = 0;
  public completedToday = 0;
  public currentStreak = 0;

  private habitService = inject(HabitService);
  private cdr = inject(ChangeDetectorRef);

  async ngOnInit(): Promise<void> {
    await this.loadDashboard();
  }

async loadDashboard(): Promise<void> {
    try {
      const habits = await firstValueFrom(this.habitService.getHabits());

      this.totalHabits = habits.length;

      const today = new Date().toDateString();

      this.completedToday = habits.filter(habit =>
        habit.completedDates.some(date =>
          new Date(date).toDateString() === today
        )
      ).length;
      this.cdr.detectChanges();

    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  }
}

