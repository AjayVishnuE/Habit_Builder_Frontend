import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})

export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);
  email = '';
  password = ''; 

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

}