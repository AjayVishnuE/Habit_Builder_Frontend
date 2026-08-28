import {
  Component,
  ElementRef,
  ViewChild,
  ChangeDetectorRef,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Router,
  RouterModule,
  ActivatedRoute
} from '@angular/router';

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
  private route = inject(ActivatedRoute);

  title = '';
  diaryId: string | null = null;
  isEditMode = false;
  saving = false;
  content = '';

  constructor(
    private diaryService: DiaryService,
    private router: Router
  ) { }

  ngOnInit(): void {

    this.diaryId = this.route.snapshot.paramMap.get('id');

    this.isEditMode = !!this.diaryId;

    if (this.isEditMode) {
      this.loadDiary();
    }
  }


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

    const content =
      this.editor.nativeElement.innerHTML.trim();

    if (!content) {

      alert('Please write something in your diary.');

      return;
    }

    this.saving = true;


    // EDIT EXISTING DIARY
    if (this.isEditMode && this.diaryId) {

      this.diaryService.updateDiary(
        this.diaryId,
        {
          title: this.title.trim(),
          content: content
        }
      ).subscribe({

        next: diary => {

          console.log('Diary updated:', diary);

          this.router.navigate([
            '/diary',
            diary._id
          ]);

          this.cdr.detectChanges();
        },

        error: error => {

          console.error(
            'Failed to update diary:',
            error
          );

          alert(
            error?.error?.message ||
            'Unable to update diary.'
          );

          this.saving = false;

          this.cdr.detectChanges();
        }

      });

      return;
    }


    // CREATE NEW DIARY
    this.diaryService.createDiary({
      title: this.title.trim(),
      content: content
    }).subscribe({

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

        this.cdr.detectChanges();
      }

    });
  }


  cancel(): void {

    if (this.isEditMode && this.diaryId) {

      this.router.navigate([
        '/diary',
        this.diaryId
      ]);

      return;
    }

    this.router.navigate(['/diary']);
  }


  loadDiary(): void {

    if (!this.diaryId) {
      return;
    }

    this.diaryService.getDiaryById(
      this.diaryId
    ).subscribe({

      next: diary => {

        this.title = diary.title;

        this.content = diary.content;

        /*
         * The editor ViewChild may not exist yet when
         * the API response arrives, so wait until the
         * view has rendered.
         */
        setTimeout(() => {

          if (this.editor) {

            this.editor.nativeElement.innerHTML =
              this.content;

          }

        });

        this.cdr.detectChanges();
      },

      error: error => {

        console.error(
          'Failed to load diary:',
          error
        );

        alert(
          error?.error?.message ||
          'Unable to load diary.'
        );

        this.router.navigate(['/diary']);
      }

    });
  }
}