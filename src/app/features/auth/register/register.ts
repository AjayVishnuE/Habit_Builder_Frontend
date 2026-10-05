import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, RouterLink, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSnackBarModule, MatIconModule ],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private cdr = inject(ChangeDetectorRef);
  isRegistering = false;
  showPassword = false;
  showConfirmPassword = false;
  registerForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  });

  register(): void {

    if (this.isRegistering) {
      return;
    }

    /*
    * Show validation messages for every field
    * when the user submits an incomplete form.
    */
    if (this.registerForm.invalid) {

      this.registerForm.markAllAsTouched();

      this.cdr.detectChanges();

      return;
    }

    /*
    * Confirm password validation.
    */
    if (
      this.registerForm.value.password !==
      this.registerForm.value.confirmPassword
    ) {

      this.registerForm.get('confirmPassword')?.markAsTouched();

      this.cdr.detectChanges();

      return;
    }

    this.isRegistering = true;

    const { name, email, password } =
      this.registerForm.getRawValue();

    this.authService.register({
      name,
      email,
      password
    }).subscribe({

      next: (response) => {

        this.authService.saveToken(response.token);

        this.snackBar.open(
          'Registration Successful 🎉',
          'Close',
          {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['app-snackbar']
          }
        );

        this.router.navigate(['/dashboard']);

      },

      error: (err) => {

        console.error(err);

        this.isRegistering = false;

        /*
        * Force Angular to immediately update
        * the disabled/loading state.
        */
        this.cdr.detectChanges();

        this.snackBar.open(
          err.error?.message || 'Registration failed',
          'Close',
          {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['app-snackbar']
          }
        );

      }

    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);

    return !!(
      field &&
      field.invalid &&
      field.touched
    );
  }

  passwordsDoNotMatch(): boolean {
    const password = this.registerForm.get('password')?.value;
    const confirmPassword = this.registerForm.get('confirmPassword')?.value;
    const confirmField = this.registerForm.get('confirmPassword');

    return !!(
      confirmField?.touched &&
      confirmPassword &&
      password !== confirmPassword
    );
  }
}