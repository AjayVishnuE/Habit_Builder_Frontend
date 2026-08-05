import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

import { Habit } from '../../../../core/models/habit.model';
import { HabitService } from '../../../../core/services/habit.service';
import { HabitCard } from '../../components/habit-card/habit-card';
import { HabitForm } from '../../components/habit-form/habit-form';

import { CompleteHabitDialog } from '../../components/complete-habit-dialog/complete-habit-dialog';
import { DeleteConfirmDialog } from '../../components/delete-confirm-dialog/delete-confirm-dialog';
import { calculateCurrentStreak, calculateLongestStreak } from '../../../../core/utils/streak.util';

@Component({
  selector: 'app-habits',
  imports: [HabitCard, MatDialogModule, MatButtonModule, MatSnackBarModule, FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  templateUrl: './habits.html',
  styleUrl: './habits.sass',
})

export class Habits implements OnInit {
  habits: Habit[] = [];
  filteredHabits: Habit[] = [];
  searchText = '';
  selectedFrequency = 'All';
  private habitService = inject(HabitService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  async ngOnInit () {
    await this.loadHabits();
  }

  async loadHabits(): Promise<void> {
    try {
      const habits = await firstValueFrom(this.habitService.getHabits());
      this.habits = habits.map(habit => ({
      ...habit,
      currentStreak: calculateCurrentStreak( habit.completedHistory, habit.frequency ),
      longestStreak: calculateLongestStreak( habit.completedHistory, habit.frequency ),
    }));

    this.applyFilters();
    this.cdr.detectChanges();
    } catch (err) {
      console.error(err);
    }
  }

  deleteHabit(id: string) {
    const habit = this.habits.find(h => h._id === id);
    if (!habit) {
      return;
    }
    const dialogRef = this.dialog.open(DeleteConfirmDialog, {
      width: '400px',
      data: habit
    });
    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        return;
      }this.habitService.deleteHabit(id).subscribe({
        next: () => {
          this.habits = this.habits.filter( h => h._id !== id );
          this.applyFilters();
          this.showMessage('Habit deleted successfully');
          this.cdr.detectChanges();
        },error: (err) => {
          console.error(err);
          this.showMessage('Failed to delete habit');
        }
      });
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
    dialogRef.afterClosed().subscribe(
      { next: (updatedHabit) => {
        if (!updatedHabit) {
          return;
        }
        this.habits = this.habits.map(h => h._id === updatedHabit._id ? {
          ...updatedHabit,
          currentStreak: calculateCurrentStreak( habit.completedHistory, habit.frequency ),
          longestStreak: calculateLongestStreak( habit.completedHistory, habit.frequency ),
        } : h );
        this.applyFilters();
        this.cdr.detectChanges();
        console.log('Updated Habits Array:', this.habits);
      },
      error: (err) => {
        console.error('Dialog Error:', err);
      },
      complete: () => {
        console.log('afterClosed() completed');
      }
    });
  }

  completeHabit(id: string) {
    const dialogRef = this.dialog.open(CompleteHabitDialog, {
      width: '500px'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        return;
      }
      this.habitService.completeHabit(id, result).subscribe({
        next: (updatedHabit) => {
          const index = this.habits.findIndex(
            h => h._id === updatedHabit._id
          );
          if (index !== -1) {
            this.habits[index] = {
              ...updatedHabit,
              currentStreak: calculateCurrentStreak( updatedHabit.completedHistory, updatedHabit.frequency ),
              longestStreak: calculateLongestStreak( updatedHabit.completedHistory, updatedHabit.frequency ),
            };
            this.applyFilters();
            this.cdr.detectChanges();
          }
          this.showMessage('Habit completed! 🎉');
        },
        error: (err) => {
          this.showMessage(
            err.error?.message ||
            'Unable to complete habit.'
          );
        }
      });
    });
  }

  openAddHabitDialog() {
    const dialogRef = this.dialog.open(HabitForm, {
      width: '500px'
    });
    dialogRef.afterClosed().subscribe((newHabit) => {
      if (newHabit) {
        this.habits.unshift({
          ...newHabit,
          currentStreak: calculateCurrentStreak( newHabit.completedHistory, newHabit.frequency ),
          longestStreak: calculateLongestStreak( newHabit.completedHistory, newHabit.frequency ),
        });        
        this.applyFilters();
        this.cdr.detectChanges();
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

  applyFilters() {
    this.filteredHabits = this.habits.filter(habit => {
      const matchesSearch =
        habit.title.toLowerCase().includes(this.searchText.toLowerCase()) ||
        habit.description.toLowerCase().includes(this.searchText.toLowerCase());
      const matchesFrequency =
        this.selectedFrequency === 'All' ||
        habit.frequency === this.selectedFrequency;
      return matchesSearch && matchesFrequency;
    });
  }

  onSearchChange(value: string) {
    this.searchText = value;
    this.applyFilters();
  }

  onFrequencyChange(value: string) {
    this.selectedFrequency = value;
    this.applyFilters();
  }

  viewDetails(id: string) {
    this.router.navigate(['/habits', id]);
  }
}

