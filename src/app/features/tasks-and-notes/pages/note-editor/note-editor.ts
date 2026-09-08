import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { NoteService } from '../../../../core/services/note.service';
import { Note } from '../../../../core/models/note-model';

@Component({
  selector: 'app-note-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './note-editor.html',
  styleUrl: './note-editor.scss'
})
export class NoteEditor implements OnInit {

  private noteService = inject(NoteService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  note: Note | null = null;
  noteId: string | null = null;
  title = '';
  content = '';
  originalTitle = '';
  originalContent = '';
  loading = true;
  saving = false;
  isNewNote = false;

  ngOnInit(): void {
    const url = this.router.url;
    if (url === '/notes/new') {
      this.isNewNote = true;
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }
    this.noteId = this.route.snapshot.paramMap.get('id');
    if (this.noteId) {
      this.loadNote(this.noteId);
    }
    this.cdr.detectChanges();
  }

  loadNote(id: string): void {
    this.loading = true;
    this.noteService.getNoteById(id).subscribe({
      next: (note) => {
        this.note = note;
        this.title = note.title;
        this.content = note.content;
        this.originalTitle = note.title;
        this.originalContent = note.content;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(
          'Failed to load note:',
          error
        );
        this.loading = false;
        this.goBack();
      }
    });
  }

  hasChanges(): boolean {
    return (
      this.title !== this.originalTitle ||
      this.content !== this.originalContent
    );
  }

  canSave(): boolean {
    return (
      this.title.trim().length > 0 &&
      this.hasChanges() &&
      !this.saving
    );
  }

  saveNote(): void {
    if (!this.canSave()) {
      return;
    }
    this.saving = true;
    const noteData = {
      title: this.title.trim(),
      content: this.content
    };

    if (this.isNewNote) {
      this.noteService.createNote(noteData).subscribe({
        next: (createdNote) => {
          this.note = createdNote;
          this.noteId = createdNote._id;
          this.isNewNote = false;
          this.title = createdNote.title;
          this.content = createdNote.content;
          this.originalTitle = createdNote.title;
          this.originalContent = createdNote.content;
          this.saving = false;
          this.router.navigate(
            ['/notes', createdNote._id],
            { replaceUrl: true }
          );
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error(
            'Failed to create note:',
            error
          );
          this.saving = false;
        }
      });
      return;
    }

    if (!this.noteId) {
      this.saving = false;
      return;
    }

    this.noteService.updateNote( this.noteId, noteData ).subscribe({
      next: (updatedNote) => {
        this.note = updatedNote;
        this.title = updatedNote.title;
        this.content = updatedNote.content;
        this.originalTitle = updatedNote.title;
        this.originalContent = updatedNote.content;
        this.saving = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(
          'Failed to update note:',
          error
        );
        this.saving = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/tasks-notes']);
  }
}