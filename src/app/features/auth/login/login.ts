import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})

export class Login {
  private authService = inject(AuthService);
  email = '';
  password = '';

  login() {
    this.authService.login({
      email: this.email,
      password: this.password
    }).subscribe({
      next: (response) => {
        console.log('Login Successful');
        this.authService.saveToken(response.token);
        console.log(response);
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

}