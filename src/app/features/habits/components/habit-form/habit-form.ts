import { Component, inject } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

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
  private data = inject(MAT_DIALOG_DATA, {optional: true });
  habitForm = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: [''],
    frequency: ['Daily']
  });

  ngOninit(){
    if (this.data) {
      this.habitForm.patchValue({
        title: this.data.title,
        description: this.data.description,
        frequency: this.data.frequency
      });
    } 
  }

  saveHabit() {
    if (this.habitForm.invalid) {
      return;
    }
    if (this.data) {
      this.habitService.updateHabit(this.data._id, this.habitForm.getRawValue()).subscribe({
        next: (updatedHabit) => {
          this.snackBar.open(
            'Habit updated successfully!',
            'Close',
            { duration: 3000 }
          );
          this.dialogRef.close(updatedHabit);
        },
        error: (err) => {
          this.snackBar.open(
            'Failed to update habit!',
            'Close',
            { duration: 3000 }
          );
          console.error(err);
        }
      });
    }
    else {
      this.habitService.createHabit(this.habitForm.value).subscribe({
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
  }

  close() {
      this.dialogRef.close();
  }
}