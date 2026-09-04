import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import { Task } from '../models/task-model';
import { API_ENDPOINTS } from '../constants/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private api = inject(ApiService);

  getTasks(): Observable<Task[]> {
    return this.api.get<Task[]>(API_ENDPOINTS.TASKS);
  }

  getTaskById(id: string): Observable<Task> {
    return this.api.get<Task>( `${API_ENDPOINTS.TASKS}/${id}` );
  }

  createTask(task: Partial<Task>) {
    return this.api.post<Task>( API_ENDPOINTS.TASKS, task );
  }

  updateTask(id: string, task: Partial<Task>) {
    return this.api.put<Task>( `${API_ENDPOINTS.TASKS}/${id}`, task );
  }

  deleteTask(id: string) {
    return this.api.delete( `${API_ENDPOINTS.TASKS}/${id}` );
  }

  toggleTask(id: string) {
    return this.api.put<Task>( `${API_ENDPOINTS.TASKS}/${id}/toggle`, {} );
  }
}