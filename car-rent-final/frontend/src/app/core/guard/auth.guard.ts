import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export type UserRole = 'Client' | 'Support' | 'Admin';

export const unifiedAuthGuard = (config: {
  allowedRoles?: UserRole | UserRole[];
  allowGuests?: boolean;
}): CanActivateFn => {
  return (route: ActivatedRouteSnapshot) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const { allowedRoles, allowGuests } = config;

    // Get current route path for better debugging
    const currentPath = route.routeConfig?.path || 'unknown';
    
    // Check if user is logged in
    if (!authService.isLoggedIn()) {
      // If guest access is allowed, permit access
      if (allowGuests) {
        return true;
      }
      // Otherwise redirect to login
      return router.createUrlTree(['/auth/sign-in']);
    }

    // User is logged in
    const user = authService.getUser();
    if (!user) {
      return router.createUrlTree(['/auth/sign-in']);
    }

    
    // If no specific roles required, allow access
    if (!allowedRoles) {
      return true;
    }

    // Check if user has the required role
    const requiredRoles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if (requiredRoles.includes(user.role as UserRole)) {
      return true;
    }

    // Handle redirects based on user role
    switch (user.role) {
      case 'Admin':
        return router.createUrlTree(['/dashboard']);
      case 'Support':
        return router.createUrlTree(['/bookings']);
      case 'Client':
      default:
        return router.createUrlTree(['/']);
    }
  };
};