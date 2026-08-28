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

  deleteDiary(id: string): void {
    const confirmed = window.confirm(
      'Are you sure you want to delete this diary?'
    );
    if (!confirmed) {
      return;
    }
    this.diaryService.deleteDiary(id).subscribe({
      next: () => {
        this.diaries = this.diaries.filter(
          diary => diary._id !== id
        );
        this.cdr.detectChanges();
      },
      error: error => {
        console.error('Failed to delete diary:', error);
        this.error = error?.error?.message ||
          'Unable to delete diary.';
        this.cdr.detectChanges();
      }
    });
  }

  isToday(date: string | Date): boolean {
    const diaryDate = new Date(date);
    const today = new Date();
    return (
      diaryDate.getFullYear() === today.getFullYear() &&
      diaryDate.getMonth() === today.getMonth() &&
      diaryDate.getDate() === today.getDate()
    );
  }


  getTodaysDiary(): Diary | undefined {
    return this.diaries.find(diary =>
      this.isToday(diary.createdAt)
    );
  }


  canCreateToday(): boolean {

    return !this.getTodaysDiary();
  }

}