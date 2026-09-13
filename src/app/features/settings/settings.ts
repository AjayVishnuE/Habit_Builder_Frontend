import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { ThemeMode, ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [ MatIconModule, MatSlideToggleModule ],
  templateUrl: './settings.html',
  styleUrl: './settings.scss'
})
export class Settings {

  private themeService = inject(ThemeService);
  private router = inject(Router);
  theme: ThemeMode = this.themeService.getTheme();

  goBack(): void {
    this.router.navigate(['/profile']);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
    this.theme = this.themeService.getTheme();
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  goToChangePassword(): void {
    this.router.navigate(['/forgot-password'], {
      queryParams: { from: 'settings' }
    });
  }
}