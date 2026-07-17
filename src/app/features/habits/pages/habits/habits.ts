import { Component, inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

import { Habit } from '../../../../core/models/habit.model';
import { HabitService } from '../../../../core/services/habit.service';
import { HabitCard } from '../../components/habit-card/habit-card';
import { HabitForm } from '../../components/habit-form/habit-form';

@Component({
  selector: 'app-habits',
  imports: [HabitCard, MatDialogModule, MatButtonModule],
  templateUrl: './habits.html',
  styleUrl: './habits.sass',
})

export class Habits implements OnInit {
  habits: Habit[] = [];
  private habitService = inject(HabitService);
  private dialog = inject(MatDialog);

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

  deleteHabit(id: string) {
    this.habitService.deleteHabit(id).subscribe({
      next: () => {
        this.habits = this.habits.filter(
          habit => habit._id !== id
        );
        console.log('Habit deleted successfully');
      },error: (err) => {
        console.error(err);
      }
    });
  }
  
  editHabit(id: string) {
    console.log('Edit:', id);
  }

  completeHabit(id: string) {
    console.log('Complete:', id);
  }

  openAddHabitDialog() {
    this.dialog.open(HabitForm, {
      width: '500px'
    });
  }
}

