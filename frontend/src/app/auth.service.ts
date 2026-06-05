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

  public login(loginRequest: LoginRequest): Observable<JwtResponse> {
    return this.http.post<JwtResponse>(`${this.apiServerUrl}/auth/login`, loginRequest).pipe(
      tap((response) => {
        localStorage.removeItem('guestMode');
        localStorage.setItem('token', response.token);
        localStorage.setItem('username', response.username);
        localStorage.setItem('role', response.role);
      })
    );
  }

  public register(signupRequest: SignupRequest): Observable<string> {
    return this.http.post(`${this.apiServerUrl}/auth/register`, signupRequest, { responseType: 'text' });
  }

  public setGuestMode(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.setItem('guestMode', 'true');
  }

  public isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  public isGuest(): boolean {
    return localStorage.getItem('guestMode') === 'true';
  }

  public isAdmin(): boolean {
    return localStorage.getItem('role') === 'ROLE_ADMIN';
  }

  public getUsername(): string {
    if (this.isGuest()) {
      return 'Guest User';
    }
    return localStorage.getItem('username') || 'User';
  }

  public getRole(): string {
    if (this.isGuest()) {
      return 'ROLE_GUEST';
    }
    return localStorage.getItem('role') || 'ROLE_USER';
  }

  public logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('guestMode');
  }
}
