import { Component, inject } from '@angular/core';

import { HabitService } from '../../../../core/services/habit.service';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.sass',
})
export class Dashboard {
  public totalHabits = 0;
  public completedToday = 0;
  public currentStreak = 0;

  private habitService = inject(HabitService);

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.habitService.getHabits().subscribe({
      next: (habits) => {
        this.totalHabits = habits.length;
        const today = new Date().toDateString();
        this.completedToday = habits.filter(habit =>
          habit.completedDates.some(date =>
            new Date(date).toDateString() === today
          )
        ).length;
      }
    });
  }

}
