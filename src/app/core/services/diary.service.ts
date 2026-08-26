import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import { Diary } from '../models/diary-model';
import { API_ENDPOINTS } from '../constants/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class DiaryService {

  private api = inject(ApiService);

  getDiaries(): Observable<Diary[]> {
    return this.api.get<Diary[]>(API_ENDPOINTS.DIARIES);
  }

  getDiaryById(id: string): Observable<Diary> {
    return this.api.get<Diary>( `${API_ENDPOINTS.DIARIES}/${id}` );
  }

  createDiary(diary: Partial<Diary>) {
    return this.api.post<Diary>( API_ENDPOINTS.DIARIES, diary );
  }

  updateDiary(id: string, diary: Partial<Diary>) {
    return this.api.put<Diary>( `${API_ENDPOINTS.DIARIES}/${id}`, diary
    );
  }

  deleteDiary(id: string) {
    return this.api.delete( `${API_ENDPOINTS.DIARIES}/${id}` );
  }
}