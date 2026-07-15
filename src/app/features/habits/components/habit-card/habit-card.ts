import { Component, Input } from '@angular/core';
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

  @Input({ required: true })
  habit!: Habit;

}