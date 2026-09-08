import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { NoteService } from '../../../../core/services/note.service';
import { Note } from '../../../../core/models/note-model';

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [ CommonModule, MatIconModule, MatButtonModule ],
  templateUrl: './notes.html',
  styleUrl: './notes.scss'
})
export class Notes implements OnInit {

  private noteService = inject(NoteService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  notes: Note[] = [];

  loading = true;

  ngOnInit(): void {
    this.loadNotes();
    this.cdr.detectChanges();
  }

  loadNotes(): void {
    this.loading = true;

    this.noteService.getNotes().subscribe({
      next: (notes) => {
        this.notes = notes;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to load notes:', error);
        this.loading = false;
      }
    });
  }

  addNote(): void {
    this.router.navigate(['/notes/new']);
  }

  openNote(note: Note): void {
    this.router.navigate(['/notes', note._id]);
  }

  deleteNote(event: Event, note: Note): void {
    event.stopPropagation();
    const confirmed = confirm(
      `Delete "${note.title}"?`
    );

    if (!confirmed) {
      return;
    }

    this.noteService.deleteNote(note._id).subscribe({
      next: () => {
        this.notes = this.notes.filter(
          item => item._id !== note._id
        );
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Failed to delete note:', error);
      }
    });
  }

  getPreview(content: string): string {
    if (!content) {
      return '';
    }

    const plainText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

    if (plainText.length <= 180) {
      return plainText;
    }

    return plainText.substring(0, 180).trim() + '...';
  }
}