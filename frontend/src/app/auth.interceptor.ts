import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  let token = null;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      token = localStorage.getItem('token');
    }
  } catch (e) {
    console.warn('localStorage is not accessible in this context:', e);
  }
  
  // If we have a JWT token, clone the request and add the Authorization header
  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }
  
  return next(req);
};
