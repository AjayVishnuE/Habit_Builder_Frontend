import { Injectable } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private readonly storageKey = 'habit-builder-theme';

  private currentTheme: ThemeMode = 'light';

  constructor() {
    this.loadTheme();
  }

  getTheme(): ThemeMode {
    return this.currentTheme;
  }

  setTheme(theme: ThemeMode): void {
    this.currentTheme = theme;

    localStorage.setItem(
      this.storageKey,
      theme
    );

    this.applyTheme(theme);
  }

  toggleTheme(): void {
    this.setTheme(
      this.currentTheme === 'light'
        ? 'dark'
        : 'light'
    );
  }

  private loadTheme(): void {

    const savedTheme =
      localStorage.getItem(this.storageKey);

    if (
      savedTheme === 'dark' ||
      savedTheme === 'light'
    ) {
      this.currentTheme = savedTheme;
    }

    this.applyTheme(this.currentTheme);
  }

  private applyTheme(theme: ThemeMode): void {

    document.documentElement.classList.toggle(
      'dark-theme',
      theme === 'dark'
    );
  }
}