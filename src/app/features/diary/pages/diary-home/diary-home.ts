import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { Diary } from '../../../../core/models/diary-model';
import { DiaryService } from '../../../../core/services/diary.service';

@Component({
  selector: 'app-diary-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './diary-home.html',
  styleUrl: './diary-home.scss'
})
export class DiaryHome implements OnInit {

  private diaryService = inject(DiaryService);
  private cdr = inject(ChangeDetectorRef);

  diaries: Diary[] = [];

  loading = true;
  error = '';

  async ngOnInit() {
    await this.loadDiaries();
    this.cdr.detectChanges();
  }

  async loadDiaries() {

    this.loading = true;
    this.error = '';

    this.diaryService.getDiaries().subscribe({
      next: diaries => {
        this.diaries = diaries;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: error => {
        console.error('Failed to load diaries:', error);
        this.error = 'Unable to load your diaries.';
        this.loading = false;
      }
    });
  }

  getPreview(content: string): string {

    const plainText = content
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (plainText.length <= 160) {
      return plainText;
    }

    return plainText.substring(0, 160) + '...';
  }

}