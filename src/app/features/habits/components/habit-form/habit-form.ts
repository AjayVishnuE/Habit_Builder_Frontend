import { Component, inject } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { HabitService } from '../../../../core/services/habit.service';

@Component({
  selector: 'app-habit-form',
  standalone: true,
imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDialogModule,
    MatSnackBarModule
  ],  
  templateUrl: './habit-form.html',
  styleUrl: './habit-form.scss'
})
export class HabitForm {

  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<HabitForm>);
  private habitService = inject(HabitService);
  private snackBar = inject(MatSnackBar);

  habitForm = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: [''],
    frequency: ['Daily']
  });

  saveHabit() {
    if (this.habitForm.invalid) {
      return;
    }
    this.habitService.createHabit(
      this.habitForm.value
    ).subscribe({
      next: (habit) => {
        this.snackBar.open(
          'Habit created successfully!',
          'Close',
          {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top'
          }
        );
        this.dialogRef.close(habit);
      },error: (err) => {
        this.snackBar.open(
          'Failed to create habit!',
          'Close',
          {
            duration: 3000
          }
        );
        console.error(err);
      }
    });
}

  close() {
      this.dialogRef.close();
  }
}