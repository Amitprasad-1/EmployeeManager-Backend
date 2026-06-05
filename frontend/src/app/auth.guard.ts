import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() || authService.isGuest()) {
    return true;
  }

  // Redirect to login page if not authenticated or not guest
  router.navigate(['/login']);
  return false;
};
