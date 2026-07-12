import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Habit } from '../../../../core/models/habit.model';
import { HabitService } from '../../../../core/services/habit';

@Component({
  selector: 'app-habits',
  imports: [],
  templateUrl: './habits.html',
  styleUrl: './habits.sass',
})

export class Habits implements OnInit {
  habits: Habit[] = [];
  private habitService = inject(HabitService);

  ngOnInit() {
    this.loadHabits();
  }

  loadHabits() {
    this.habitService.getHabits().subscribe({
      next: (response) => {
        this.habits = response;
        console.log(response);
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
}

