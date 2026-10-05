import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, MatIconModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})

export class Login {
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  isLoggingIn = false;
  loginError = '';
  email = '';
  password = ''; 
  showPassword = false;

  login(): void {
    if (this.isLoggingIn) {
      return;
    }
    this.loginError = '';
    this.isLoggingIn = true;
    this.authService.login({
      email: this.email,
      password: this.password
    }).subscribe({
      next: (response) => {
        this.authService.saveToken(response.token);
        this.router.navigate(['/dashboard']);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(error);
        this.isLoggingIn = false;
        this.loginError = error.error.message;
        this.cdr.detectChanges();
      }
    });
  }

  goToForgotPassword(): void {
    this.router.navigate(['/forgot-password'], {
      queryParams: { from: 'login' }
    });
  }
}