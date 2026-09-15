import { Component, inject } from '@angular/core';
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
  private router = inject(Router);
  email = '';
  password = ''; 
  showPassword = false;

  login() {
    this.authService.login({
      email: this.email,
      password: this.password
    }).subscribe({
      next: (response) => {
        this.authService.saveToken(response.token);
        console.log(response);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  goToForgotPassword(): void {
    this.router.navigate(['/forgot-password'], {
      queryParams: { from: 'login' }
    });
  }
}