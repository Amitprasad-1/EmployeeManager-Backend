import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  public activeTab: 'login' | 'register' = 'login';
  public isDarkTheme: boolean = false;
  
  // Login Form fields
  public loginData = {
    username: '',
    password: ''
  };

  // Register Form fields
  public registerData = {
    username: '',
    email: '',
    password: '',
    role: 'ROLE_USER'
  };

  // Status/Alerts
  public errorMessage: string = '';
  public successMessage: string = '';
  public isLoading: boolean = false;

  // Toast notifications state
  public toasts: Array<{ id: number; message: string; type: 'success' | 'error' | 'info' }> = [];
  private toastIdCounter = 0;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTheme();
    // If already logged in, redirect to dashboard
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  public showToast(message: string, type: 'success' | 'error' | 'info' = 'success'): void {
    const id = this.toastIdCounter++;
    this.toasts.push({ id, message, type });
    setTimeout(() => {
      this.removeToast(id);
    }, 4000);
  }

  public removeToast(id: number): void {
    this.toasts = this.toasts.filter(t => t.id !== id);
  }

  public switchTab(tab: 'login' | 'register'): void {
    this.activeTab = tab;
    this.errorMessage = '';
    this.successMessage = '';
  }

  public onLogin(form: NgForm): void {
    if (form.invalid) return;
    this.isLoading = true;
    this.errorMessage = '';
    
    this.authService.login(this.loginData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.showToast(`Welcome back, ${response.username}!`, 'success');
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.status === 401 
          ? 'Invalid username or password.' 
          : 'Could not connect to authentication server.';
        this.showToast(this.errorMessage, 'error');
      }
    });
  }

  public onRegister(form: NgForm): void {
    if (form.invalid) return;
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.register(this.registerData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Account registered successfully! Please sign in.';
        this.showToast('Registration successful!', 'success');
        this.activeTab = 'login';
        // Prefill login username
        this.loginData.username = this.registerData.username;
        this.registerData = {
          username: '',
          email: '',
          password: '',
          role: 'ROLE_USER'
        };
        form.resetForm({ role: 'ROLE_USER' });
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error || 'Registration failed. Please check details.';
        this.showToast(this.errorMessage, 'error');
      }
    });
  }

  public continueAsGuest(): void {
    this.authService.setGuestMode();
    this.showToast('Continuing as Guest (Read-Only Access)', 'info');
    setTimeout(() => {
      this.router.navigate(['/dashboard']);
    }, 1000);
  }

  // Theme controls
  public toggleTheme(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.isDarkTheme = isChecked;
    try {
      if (isChecked) {
        document.body.classList.add('dark-theme');
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('theme', 'dark');
        }
      } else {
        document.body.classList.remove('dark-theme');
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('theme', 'light');
        }
      }
    } catch (e) {
      console.warn('localStorage is not accessible:', e);
    }
  }

  private loadTheme(): void {
    let savedTheme = null;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        savedTheme = localStorage.getItem('theme');
      }
    } catch (e) {
      console.warn('localStorage is not accessible:', e);
    }
    this.isDarkTheme = savedTheme === 'dark';
    if (this.isDarkTheme) {
      document.body.classList.add('dark-theme');
    }
  }
}
