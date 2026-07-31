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
    if (!this.habit.completedHistory.length) {
      return false;
    }
    const lastCompleted = new Date(
      this.habit.completedHistory[
        this.habit.completedHistory.length - 1
      ].completedAt
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

  @Input({ required: true })
  habit!: Habit;

  @Output()
  delete = new EventEmitter<string>();

  @Output()
  edit = new EventEmitter<string>();

  @Output()
  complete = new EventEmitter<string>();

  @Output()
  details = new EventEmitter<string>();
}