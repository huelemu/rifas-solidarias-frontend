import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs/operators';

export const loginRedirectGuard = () => {
  const authService = inject(AuthService);
  
  return authService.isAuthenticated$.pipe(
    map(isAuthenticated => {
      if (isAuthenticated) {
        authService.redirectToDashboard();
        return false;
      }
      return true;
    })
  );
};