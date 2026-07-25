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
  isCompleted(): boolean {
    if (!this.habit.completedDates.length) {
      return false;
    }
    const lastCompleted = new Date(
      this.habit.completedDates[this.habit.completedDates.length - 1]
    );
    const today = new Date();
    switch (this.habit.frequency) {
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
    const first = new Date(date1);
    const second = new Date(date2);
    first.setHours(0,0,0,0);
    second.setHours(0,0,0,0);
    const firstWeek = Math.floor(first.getTime() / (7 * 24 * 60 * 60 * 1000));
    const secondWeek = Math.floor(second.getTime() / (7 * 24 * 60 * 60 * 1000));
    return firstWeek === secondWeek;
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