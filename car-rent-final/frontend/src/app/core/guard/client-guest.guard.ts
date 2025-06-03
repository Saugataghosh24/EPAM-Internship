// client-guest.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export const clientGuestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Allow access if user is not logged in
  if (!authService.isLoggedIn()) {
    return true;
  }
  
  // Allow access if user is logged in as a Client
  const user = authService.getUser();
  if (user && user.role === 'Client') {
    return true;
  }
  
  // Redirect based on user's actual role
  if (user?.role === 'Admin') {
    return router.createUrlTree(['/dashboard']);
  } else if (user?.role === 'Support') {
    return router.createUrlTree(['/bookings']);
  } else {
    return router.createUrlTree(['/']);
  }
};