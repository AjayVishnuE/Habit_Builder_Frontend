import { Component, inject, OnInit} from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
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
export class HabitForm implements OnInit {

  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<HabitForm>);
  private habitService = inject(HabitService);
  private snackBar = inject(MatSnackBar);
  public data = inject(MAT_DIALOG_DATA, {optional: true });
  habitForm = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: [''],
    frequency: ['Daily', Validators.required]
  });

  ngOnInit(){
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
          this.showMessage('Habit updated successfully!');
          this.dialogRef.close(updatedHabit);
        },
        error: (err) => {
          this.showMessage('Failed to update habit!');
          console.error(err);
        }
      });
    }
    else {
      this.habitService.createHabit(this.habitForm.getRawValue()).subscribe({
        next: (habit) => {
          this.showMessage('Habit created successfully!');
          this.dialogRef.close(habit);
        },error: (err) => {
          this.showMessage('Failed to create habit!');
          console.error(err);
        }
      });
    }
  }

  close() {
      this.dialogRef.close();
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