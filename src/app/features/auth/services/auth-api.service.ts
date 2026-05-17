import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import {
  RegisterIdentityRequest,
  RegisterCatalogsResponse,
  RegisterPreferencesRequest,
  RegisterStartRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from '../../../interfaces/auth';
import { ApiClientService } from '../../../shared/services/api-client.service';
import { normalizeAuthResponse, normalizeCatalogsResponse } from './normalizers';

@Injectable({
  providedIn: 'root',
})
export class AuthApiService {
  private readonly apiClient = inject(ApiClientService);

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.apiClient
      .post<unknown>('/auth/login', payload)
      .pipe(map((response) => normalizeAuthResponse(response)));
  }

  register(payload: RegisterRequest): Observable<RegisterResponse> {
    return this.apiClient
      .post<unknown>('/auth/register', payload)
      .pipe(map((response) => normalizeAuthResponse(response)));
  }

  startRegistration(payload: RegisterStartRequest): Observable<RegisterResponse> {
    return this.apiClient
      .post<unknown>('/auth/register', payload)
      .pipe(map((response) => normalizeAuthResponse(response)));
  }

  completeRegistrationIdentity(payload: RegisterIdentityRequest): Observable<RegisterResponse> {
    return this.apiClient
      .put<unknown>('/auth/register', payload)
      .pipe(map((response) => normalizeAuthResponse(response)));
  }

  completeRegistrationPreferences(
    payload: RegisterPreferencesRequest
  ): Observable<RegisterResponse> {
    return this.apiClient
      .put<unknown>('/auth/register', payload)
      .pipe(map((response) => normalizeAuthResponse(response)));
  }

  getSessionProfile(): Observable<LoginResponse> {
    return this.apiClient
      .get<unknown>('/auth/session')
      .pipe(map((response) => normalizeAuthResponse(response)));
  }

  getPublicProfile(username: string): Observable<LoginResponse> {
    return this.apiClient
      .get<unknown>(`/auth/public-profile/${encodeURIComponent(username)}`)
      .pipe(map((response) => normalizeAuthResponse(response)));
  }

  getRegistrationCatalogs(): Observable<RegisterCatalogsResponse> {
    return this.apiClient
      .get<unknown>('/auth/catalogs')
      .pipe(map((response) => normalizeCatalogsResponse(response)));
  }
}
