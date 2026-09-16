import { Component,signal, inject, OnDestroy } from '@angular/core';
import { App as CapacitorApp } from '@capacitor/app';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from '../app/core/services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnDestroy {

  private themeService = inject(ThemeService);
  protected readonly title = signal('HB_Frontend');

  private backButtonListener: any;

  constructor() {
    this.setupAndroidBackButton();
  }

  private async setupAndroidBackButton(): Promise<void> {

    this.backButtonListener =
      await CapacitorApp.addListener(
        'backButton',
        ({ canGoBack }) => {

          if (canGoBack) {
            window.history.back();
          } else {
            CapacitorApp.exitApp();
          }

        }
      );
  }

  async ngOnDestroy(): Promise<void> {

    if (this.backButtonListener) {
      await this.backButtonListener.remove();
    }

  }
}