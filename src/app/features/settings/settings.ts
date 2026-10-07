import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ThemeMode, ThemeService } from '../../core/services/theme.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    MatIconModule,
    MatSlideToggleModule,
    MatDialogModule
  ],
  templateUrl: './settings.html',
  styleUrl: './settings.scss'
})

export class Settings {

  private themeService = inject(ThemeService);
  private router = inject(Router);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  theme: ThemeMode = this.themeService.getTheme();
  deletingAccount = false;
  showDeleteConfirmation = false;

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

  openDeleteAccountConfirmation(): void {
    if (this.deletingAccount) {
      return;
    }
    this.showDeleteConfirmation = true;
  }

  cancelDeleteAccount(): void {
    if (this.deletingAccount) {
      return;
    }
    this.showDeleteConfirmation = false;
  }

  confirmDeleteAccount(): void {
    if (this.deletingAccount) {
      return;
    }
    this.deletingAccount = true;
    this.authService.deleteAccount().subscribe({
      next: (response) => {
        console.log(response.message);
        localStorage.removeItem('token');
        this.showDeleteConfirmation = false;
        this.deletingAccount = false;
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error(
          'Failed to delete account:',
          error
        );
        this.deletingAccount = false;
      }
    });
  }
}