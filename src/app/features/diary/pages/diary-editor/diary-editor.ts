import { Component, ElementRef, ViewChild, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { DiaryService } from '../../../../core/services/diary.service';

@Component({
  selector: 'app-diary-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './diary-editor.html',
  styleUrl: './diary-editor.scss'
})
export class DiaryEditor {

  @ViewChild('editor')
  editor!: ElementRef<HTMLDivElement>;

  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);

  title = '';
  content = '';
  diaryId: string | null = null;
  isEditMode = false;
  // Special missed-diary mode
  isMissedDiaryMode = false;
  // YYYY-MM-DD
  diaryDate = '';
  saving = false;
  error = '';
  writtenDates: Date[] = [];
  selectedDiaryDate: Date = new Date();

  constructor(
    private diaryService: DiaryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.diaryId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.diaryId;
    // Only NEW diary can enter missed mode.
    if (!this.isEditMode) {
      this.isMissedDiaryMode = this.route.snapshot.queryParamMap.get('missed') === 'true';
      if (this.isMissedDiaryMode) {
        this.diaryDate = this.getTodayString();
        if (this.isMissedDiaryMode) {
          this.diaryDate = this.getTodayString();
          this.loadWrittenDates();
        }
      }
    }
    if (this.isEditMode) {
      this.loadDiary();
    }
  }


  // -------------------------------------------------------
  // DATE
  // -------------------------------------------------------

  getTodayString(): string {
    const today = new Date();
    return this.formatDate(today);
  }


  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(
      date.getMonth() + 1
    ).padStart(2, '0');
    const day = String(
      date.getDate()
    ).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getMaxDate(): string {
    return this.getTodayString();
  }

  getSelectedDateLabel(): string {
    if (!this.diaryDate) {
      return '';
    }
    // Parse locally instead of using new Date('YYYY-MM-DD')
    // to avoid timezone shifting.
    const [year, month, day] =
      this.diaryDate.split('-').map(Number);

    const date =
      new Date(year, month - 1, day);

    return date.toLocaleDateString(
      'en-IN',
      {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }
    );
  }

  // -------------------------------------------------------
  // EDITOR
  // -------------------------------------------------------
  format(command: string): void {
    this.editor.nativeElement.focus();
    document.execCommand(
      command,
      false
    );
  }


  formatBlock(tag: string): void {
    this.editor.nativeElement.focus();
    document.execCommand(
      'formatBlock',
      false,
      tag
    );
  }

  // -------------------------------------------------------
  // SAVE
  // -------------------------------------------------------

  saveDiary(): void {
    this.error = '';
    if (!this.title.trim()) {
      this.error =
        'Please enter a diary heading.';

      return;
    }

    const content = this.editor.nativeElement.innerHTML.trim();
    if (!content) {
      this.error = 'Please write something in your diary.';
      return;
    }
    // Missed diary must have a date.
    if (
      !this.isEditMode &&
      this.isMissedDiaryMode &&
      !this.diaryDate
    ) {
      this.error = 'Please select the day this diary belongs to.';
      return;
    }
    // Prevent future date even before the request.
    if (
      !this.isEditMode &&
      this.isMissedDiaryMode &&
      this.diaryDate > this.getTodayString()
    ) {

      this.error =
        'You cannot write a diary for a future date.';
      return;
    }
    this.saving = true;

    // -----------------------------------------------------
    // EDIT
    // -----------------------------------------------------
    if (
      this.isEditMode &&
      this.diaryId
    ) {
      this.diaryService.updateDiary(
        this.diaryId,
        {
          title: this.title.trim(),
          content
        }
      ).subscribe({
        next: diary => {
          this.router.navigate([
            '/diary',
            diary._id
          ]);
          this.cdr.detectChanges();
        },
        error: error => {
          this.error = error?.error?.message || 'Unable to update diary.';
          this.saving = false;
          this.cdr.detectChanges();
        }
      });
      return;
    }
    // -----------------------------------------------------
    // CREATE
    // -----------------------------------------------------
    const diaryPayload: {
      title: string;
      content: string;
      diaryDate?: string;
    } = {
      title: this.title.trim(),
      content
    };
    // Only send diaryDate in missed mode.
    if (this.isMissedDiaryMode) {
      diaryPayload.diaryDate =
        this.diaryDate;
    }
    this.diaryService.createDiary(diaryPayload).subscribe({
        next: diary => {
          this.router.navigate([ '/diary', diary._id ]);
        },
        error: error => {
          this.error = error?.error?.message || 'Unable to save diary.';
          this.saving = false;
          this.cdr.detectChanges();
        }
      });
  }

  // -------------------------------------------------------
  // CANCEL
  // -------------------------------------------------------

  cancel(): void {
    if ( this.isEditMode && this.diaryId ) {
      this.router.navigate([ '/diary', this.diaryId ]);
      return;
    }
    this.router.navigate([ '/diary' ]);
  }

  // -------------------------------------------------------
  // LOAD EDIT DIARY
  // -------------------------------------------------------

  loadDiary(): void {
    if (!this.diaryId) {
      return;
    }
    this.diaryService.getDiaryById(this.diaryId).subscribe({
        next: diary => {
          this.title = diary.title;
          this.content = diary.content;
          setTimeout(() => {
            if (this.editor) {
              this.editor.nativeElement.innerHTML = this.content;
            }
          });
          this.cdr.detectChanges();
        },
        error: error => {
          this.error = error?.error?.message || 'Unable to load diary.';
          this.router.navigate([ '/diary' ]);
        }
      });
  }

  loadWrittenDates(): void {
    this.diaryService.getDiaries().subscribe({
      next: diaries => {
        this.writtenDates = diaries.map(
          diary =>
            new Date(
              diary.diaryDate ||
              diary.createdAt
            )
        );
        this.cdr.detectChanges();
      },
      error: error => {
        console.error(
          'Unable to load diary dates:',
          error
        );
      }
    });
  }

  dateFilter = (date: Date | null): boolean => {
    if (!date) {
      return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const candidate = new Date(date);
    candidate.setHours(0, 0, 0, 0);
    // Future dates disabled.
    if (candidate > today) {
      return false;
    }
    // Already written dates disabled.
    return !this.writtenDates.some(
      writtenDate => {
        const existing = new Date(writtenDate);
        existing.setHours(0, 0, 0, 0);
        return (
          existing.getFullYear() === candidate.getFullYear() &&
          existing.getMonth() === candidate.getMonth() &&
          existing.getDate() === candidate.getDate()
        );
      }
    );
  };

  getTodayDate(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  onDateSelected(date: Date | null): void {
    if (!date) {
      return;
    }
    this.diaryDate = this.formatDate(date);
  }

}