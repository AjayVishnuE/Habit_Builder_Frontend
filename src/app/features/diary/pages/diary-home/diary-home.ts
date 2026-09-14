import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

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
  private router = inject(Router);

  diaries: Diary[] = [];
  loading = true;
  error = '';

  ngOnInit(): void {
    this.loadDiaries();
  }

  loadDiaries(): void {
    this.loading = true;
    this.error = '';
    this.diaryService.getDiaries().subscribe({
      next: diaries => {
        this.diaries = diaries.sort((a, b) => {
          const dateA = this.getDiaryDate(a).getTime();
          const dateB = this.getDiaryDate(b).getTime();

          return dateB - dateA;
        });

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: error => {
        console.error('Failed to load diaries:', error);
        this.error = error?.error?.message || 'Unable to load your diaries.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // -------------------------------------------------------
  // DATE HELPERS
  // -------------------------------------------------------

  getDiaryDate(diary: Diary): Date {
    const diaryDate = diary.diaryDate
      ? new Date(diary.diaryDate)
      : null;

    const createdDate = new Date(diary.createdAt);

    // If diaryDate is today, but createdAt belongs to an earlier day,
    // treat diaryDate as an automatically assigned/incorrect date.
    if (
      diaryDate &&
      this.isToday(diaryDate) &&
      !this.isToday(createdDate)
    ) {
      return createdDate;
    }

    return diaryDate || createdDate;
  }


  isToday(date: string | Date): boolean {
    const diaryDate = new Date(date);
    const today = new Date();
    if (isNaN(diaryDate.getTime())) {
      return false;
    }
    return (
      diaryDate.getFullYear() === today.getFullYear() &&
      diaryDate.getMonth() === today.getMonth() &&
      diaryDate.getDate() === today.getDate()
    );
  }

  getTodaysDiary(): Diary | undefined {
    return this.diaries.find(diary =>
      this.isToday(this.getDiaryDate(diary))
    );
  }

  canCreateToday(): boolean {
    return !this.getTodaysDiary();
  }

  // -------------------------------------------------------
  // PREVIEW
  // -------------------------------------------------------

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


  // -------------------------------------------------------
  // DELETE
  // -------------------------------------------------------

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
        this.error = error?.error?.message || 'Unable to delete diary.';
        this.cdr.detectChanges();
      }
    });
  }

  // -------------------------------------------------------
  // MISSED DIARY
  // -------------------------------------------------------

  addMissedDiary(): void {
    this.router.navigate([
      '/diary/new'
    ], {
      queryParams: {
        missed: 'true'
      }
    });
  }
}