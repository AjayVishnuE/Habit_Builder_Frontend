import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import { Note } from '../models/note-model';
import { API_ENDPOINTS } from '../constants/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class NoteService {

  private api = inject(ApiService);

  getNotes(): Observable<Note[]> {
    return this.api.get<Note[]>(API_ENDPOINTS.NOTES);
  }

  getNoteById(id: string): Observable<Note> {
    return this.api.get<Note>( `${API_ENDPOINTS.NOTES}/${id}` );
  }

  createNote(note: Partial<Note>) {
    return this.api.post<Note>( API_ENDPOINTS.NOTES, note );
  }

  updateNote(id: string, note: Partial<Note>) {
    return this.api.put<Note>( `${API_ENDPOINTS.NOTES}/${id}`, note );
  }

  deleteNote(id: string) {
    return this.api.delete( `${API_ENDPOINTS.NOTES}/${id}` );
  }
}