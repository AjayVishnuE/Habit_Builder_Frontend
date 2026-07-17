import { Component, inject } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';

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
    MatDialogModule
  ],  
  templateUrl: './habit-form.html',
  styleUrl: './habit-form.scss'
})
export class HabitForm {

  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<HabitForm>);
  private habitService = inject(HabitService);

  habitForm = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    frequency: ['Daily', Validators.required]
  });

  saveHabit() {
    if (this.habitForm.invalid) {
      return;
    }
    this.habitService.createHabit(
      this.habitForm.value
    ).subscribe({
      next: (habit) => {
        console.log(habit);
      }, error: (err) => {
        console.error(err);
      }
    });

}

  close() {
      this.dialogRef.close();
  }
}