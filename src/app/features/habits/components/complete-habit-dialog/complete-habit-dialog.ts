import { Component, inject } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-complete-habit-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule
  ],
  templateUrl: './complete-habit-dialog.html',
  styleUrl: './complete-habit-dialog.scss'
})

export class CompleteHabitDialog {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<CompleteHabitDialog>);

  completeForm = this.fb.nonNullable.group({
    mood: ['Good', Validators.required],
    duration: [
      0,
      [
        Validators.required,
        Validators.min(0)
      ]
    ],
    remark: ['']
  });

  complete() {
    if (this.completeForm.invalid) {
      return;
    }
    this.dialogRef.close(
      this.completeForm.getRawValue()
    );
  }

  cancel() {
    this.dialogRef.close();
  }

}