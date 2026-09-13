import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ProfileService } from '../../../core/services/profile.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, MatIconModule, MatSnackBarModule ],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss'
})

export class ForgotPassword {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private profileService = inject(ProfileService);
  private snackBar = inject(MatSnackBar);
  private route = inject(ActivatedRoute);

  forgotForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  isLoading = false;
  submitted = false;
  submit(): void {
    this.submitted = true;
    if (this.forgotForm.invalid) {
      return;
    }

    this.isLoading = true;
    const email = this.forgotForm.value.email.trim();
    this.profileService.forgotPassword(email).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.snackBar.open(
          response.message ||
            'If an account exists with that email, a reset link has been sent.',
          'Close',
          {
            duration: 5000
          }
        );

        this.submitted = false;
        this.forgotForm.reset();
        // Keep the user on this page so they can see the
        // "check your email" state.
        this.submitted = true;
      },
      error: (error) => {
        this.isLoading = false;
        this.snackBar.open(
          error?.error?.message ||
            'Something went wrong. Please try again later.',
          'Close',
          {
            duration: 4000
          }
        );
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
  goBack(): void {
    const from = this.route.snapshot.queryParamMap.get('from');
    if (from === 'settings') {
      this.router.navigate(['/settings']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}