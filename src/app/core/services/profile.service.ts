import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';

import {
  Profile,
  ProfileStats
} from '../models/profile-model';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private api = inject(ApiService);

  getProfile(): Observable<Profile> {
    return this.api.get<Profile>( API_ENDPOINTS.PROFILE );
  }

  updateProfile(name: string): Observable<Profile> {
    return this.api.put<Profile>( API_ENDPOINTS.PROFILE, { name } );
  }

  getProfileStats(): Observable<ProfileStats> {
    return this.api.get<ProfileStats>( API_ENDPOINTS.PROFILE_STATS );
  }
}