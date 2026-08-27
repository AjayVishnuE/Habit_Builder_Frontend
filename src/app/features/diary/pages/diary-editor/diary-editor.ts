import { Component, ElementRef, ViewChild, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { DiaryService } from '../../../../core/services/diary.service';

@Component({
  selector: 'app-diary-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './diary-editor.html',
  styleUrl: './diary-editor.scss'
})
export class DiaryEditor {

  @ViewChild('editor')
  editor!: ElementRef<HTMLDivElement>;
  private cdr = inject(ChangeDetectorRef);

  title = '';

  saving = false;

  constructor(
    private diaryService: DiaryService,
    private router: Router
  ) {}

  format(command: string): void {
    this.editor.nativeElement.focus();
    document.execCommand(command, false);
  }

  formatBlock(tag: string): void {
    this.editor.nativeElement.focus();
    document.execCommand(
      'formatBlock',
      false,
      tag
    );

  }

  saveDiary(): void {
    if (!this.title.trim()) {
      alert('Please enter a diary heading.');
      return;
    }
    const content = this.editor.nativeElement.innerHTML.trim();
    if (!content) {
      alert('Please write something in your diary.');
      return;
    }

    this.saving = true;

    this.diaryService.createDiary({ title: this.title.trim(), content }).subscribe({
      next: diary => {
        console.log('Diary created:', diary);
        this.router.navigate([
          '/diary',
          diary._id
        ]);
        this.cdr.detectChanges();
      },
      error: error => {
        console.error(
          'Failed to create diary:',
          error
        );
        alert(
          error?.error?.message ||
          'Unable to save diary.'
        );
        this.saving = false;
      }

    });

  }

  cancel(): void {
    this.router.navigate(['/diary']);
  }

}