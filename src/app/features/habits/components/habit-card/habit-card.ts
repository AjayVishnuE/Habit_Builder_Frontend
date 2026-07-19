import { Component, Input, Output, EventEmitter  } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Habit } from '../../../../core/models/habit.model';

@Component({
  selector: 'app-habit-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './habit-card.html',
  styleUrl: './habit-card.scss'
})
export class HabitCard {
  isCompletedToday(): boolean {
    const today = new Date().toDateString();
    return this.habit.completedDates.some(
      date => new Date(date).toDateString() === today
    );
  }
  @Input({ required: true })
  habit!: Habit;

  @Output()
  delete = new EventEmitter<string>();

  @Output()
  edit = new EventEmitter<string>();

  @Output()
  complete = new EventEmitter<string>();
}