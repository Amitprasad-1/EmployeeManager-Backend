import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../environments/environment';

export interface LoginRequest {
  username: string;
  password?: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  password?: string;
  role: string;
}

export interface JwtResponse {
  token: string;
  username: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiServerUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  private setStorageItem(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, value);
      }
    } catch (e) {
      console.warn('localStorage is not accessible:', e);
    }
  }

  private getStorageItem(key: string): string | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem(key);
      }
    } catch (e) {
      console.warn('localStorage is not accessible:', e);
    }
    return null;
  }

  private removeStorageItem(key: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(key);
      }
    } catch (e) {
      console.warn('localStorage is not accessible:', e);
    }
  }

  public login(loginRequest: LoginRequest): Observable<JwtResponse> {
    return this.http.post<JwtResponse>(`${this.apiServerUrl}/auth/login`, loginRequest).pipe(
      tap((response) => {
        this.removeStorageItem('guestMode');
        this.setStorageItem('token', response.token);
        this.setStorageItem('username', response.username);
        this.setStorageItem('role', response.role);
      })
    );
  }

  public register(signupRequest: SignupRequest): Observable<string> {
    return this.http.post(`${this.apiServerUrl}/auth/register`, signupRequest, { responseType: 'text' });
  }

  public setGuestMode(): void {
    this.removeStorageItem('token');
    this.removeStorageItem('username');
    this.removeStorageItem('role');
    this.setStorageItem('guestMode', 'true');
  }

  public isAuthenticated(): boolean {
    return !!this.getStorageItem('token');
  }

  public isGuest(): boolean {
    return this.getStorageItem('guestMode') === 'true';
  }

  public isAdmin(): boolean {
    return this.getStorageItem('role') === 'ROLE_ADMIN';
  }

  public getUsername(): string {
    if (this.isGuest()) {
      return 'Guest User';
    }
    return this.getStorageItem('username') || 'User';
  }

  public getRole(): string {
    if (this.isGuest()) {
      return 'ROLE_GUEST';
    }
    return this.getStorageItem('role') || 'ROLE_USER';
  }

  public logout(): void {
    this.removeStorageItem('token');
    this.removeStorageItem('username');
    this.removeStorageItem('role');
    this.removeStorageItem('guestMode');
  }
}
