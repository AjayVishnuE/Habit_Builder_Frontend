import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { LoginRequest } from '../models/login-request.model';
import { LoginResponse } from '../models/login-response.model';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  private api = inject(ApiService);

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.api.post<LoginResponse>(
      API_ENDPOINTS.LOGIN,
      credentials
    );
  }

}