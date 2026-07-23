import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

import { Habit } from '../../../../core/models/habit.model';
import { HabitService } from '../../../../core/services/habit.service';
import { HabitCard } from '../../components/habit-card/habit-card';
import { HabitForm } from '../../components/habit-form/habit-form';
import { calculateCurrentStreak, calculateLongestStreak } from '../../../../core/utils/streak.util';

@Component({
  selector: 'app-habits',
  imports: [HabitCard, MatDialogModule, MatButtonModule, MatSnackBarModule],
  templateUrl: './habits.html',
  styleUrl: './habits.sass',
})

export class Habits implements OnInit {
  habits: Habit[] = [];
  private habitService = inject(HabitService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  private cdr = inject(ChangeDetectorRef);

  async ngOnInit() {
    await this.loadHabits();
  }

  async loadHabits(): Promise<void> {
    try {
      const habits = await firstValueFrom(this.habitService.getHabits());
      this.habits = habits.map(habit => ({
      ...habit,
      currentStreak: calculateCurrentStreak(habit.completedDates),
      longestStreak: calculateLongestStreak(habit.completedDates)
    }));


      this.cdr.detectChanges();
    } catch (err) {
      console.error(err);
    }
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
    const habit = this.habits.find(h => h._id === id);
    if (!habit) {
      return;
    }
    const dialogRef = this.dialog.open(HabitForm, {
      width: '500px',
      data: habit
    });
    dialogRef.afterClosed().subscribe((updatedHabit) => {
      if (!updatedHabit) {
        return;
      }
      const index = this.habits.findIndex(h => h._id === updatedHabit._id);
      if (index !== -1) {
        this.habits[index] = updatedHabit;
      }
    });

  }

  completeHabit(id: string) {
    this.habitService.completeHabit(id).subscribe({
      next: (updatedHabit) => {
        const index = this.habits.findIndex(h => h._id === updatedHabit._id);
        if (index !== -1) {
          this.habits[index] = updatedHabit;
          this.cdr.detectChanges();
        }
        this.showMessage('Habit completed! 🎉');
      },
      error: (err) => {
        this.showMessage(err.error?.message || 'Unable to complete habit.');
      }
    });
  }

  openAddHabitDialog() {
    const dialogRef = this.dialog.open(HabitForm, {
      width: '500px'
    });
    dialogRef.afterClosed().subscribe((newHabit) => {
      if (newHabit) {
        this.habits.unshift(newHabit);
        console.log("Habit Added Successfully");
      }
    });
  }

  private showMessage(message: string) {
    this.snackBar.open(
      message,
      'Close',
      {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top'
      }
    );
  }
}

