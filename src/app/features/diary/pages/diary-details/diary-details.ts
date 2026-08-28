import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';

import { DiaryService } from '../../../../core/services/diary.service';

@Component({
  selector: 'app-diary-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './diary-details.html',
  styleUrl: './diary-details.scss'
})
export class DiaryDetails implements OnInit {

  private route = inject(ActivatedRoute);
  private diaryService = inject(DiaryService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  diary: any = null;
  loading = true;
  error = '';

  ngOnInit(): void {

    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error = 'Diary not found.';
      this.loading = false;
      return;
    }

    this.diaryService.getDiaryById(id).subscribe({
      next: (diary) => {
        this.diary = diary;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.error = 'Unable to load diary.';
        this.loading = false;
      }
    });
  }

  editDiary(): void {
    if (!this.diary?._id) {
      return;
    }

    this.router.navigate(['/diary/edit', this.diary._id]);
  }
}