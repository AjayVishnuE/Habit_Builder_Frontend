import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Habit } from '../models/habit.model';
import { API_ENDPOINTS } from '../constants/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class HabitService {

  private api = inject(ApiService);
  getHabits(): Observable<Habit[]> {
    return this.api.get<Habit[]>(API_ENDPOINTS.HABITS);
  }
  
  deleteHabit(id: string) {
    return this.api.delete(`${API_ENDPOINTS.HABITS}/${id}`);
  }

  createHabit(habit: Partial<Habit>) {
    return this.api.post<Habit>(API_ENDPOINTS.HABITS,habit);
  }
}