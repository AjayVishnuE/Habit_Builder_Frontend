import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ProfileService } from '../../../core/services/profile.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss'
})
export class ResetPassword {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private profileService = inject(ProfileService);
  private snackBar = inject(MatSnackBar);

  resetForm: FormGroup = this.fb.group(
    {
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6)
        ]
      ],

      confirmPassword: [
        '',
        [
          Validators.required
        ]
      ]
    },
    {
      validators: this.passwordMatchValidator
    }
  );

  token = '';

  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;
  resetSuccess = false;
  resetError = false;

  constructor() {
    this.token = this.route.snapshot.paramMap.get('token') || '';

    if (!this.token) {
      this.resetError = true;
    }
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    if (!password || !confirmPassword) {
      return null;
    }

    return password === confirmPassword
      ? null
      : { passwordMismatch: true };
  }

  submit(): void {
    if (!this.token) {
      this.resetError = true;
      return;
    }

    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const password = this.resetForm.get('password')?.value;
    this.profileService.resetPassword(this.token, password).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.resetSuccess = true;
        this.snackBar.open(
          response.message || 'Password reset successfully.',
          'Close',
          {
            duration: 4000
          }
        );
      },

      error: (error) => {
        this.isLoading = false;
        this.resetError = true;
        this.snackBar.open(
          error?.error?.message ||
            'This password reset link is invalid or has expired.',
          'Close',
          {
            duration: 5000
          }
        );
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}