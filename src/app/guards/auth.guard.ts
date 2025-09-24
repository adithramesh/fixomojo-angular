import { CanActivateFn, Router } from '@angular/router';
import { selectTempUserId } from '../store/auth/auth.reducer';
import { Store } from '@ngrx/store';
import { inject, PLATFORM_ID } from '@angular/core';
import { map, take } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { JwtHelperService } from '@auth0/angular-jwt';

export const authGuard: CanActivateFn = () => true;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const dontGoBack: CanActivateFn = (route, _state) => {
  const store = inject(Store);
  const platformId = inject(PLATFORM_ID);
  const token = isPlatformBrowser(platformId)
    ? localStorage.getItem('access_token')
    : null;

  return store.select(selectTempUserId).pipe(
    take(1),
    map((tempUserId: string | null) => {
      const isOtpRoute =
        route.routeConfig?.path === 'signup/verify-otp' ||
        route.routeConfig?.path === 'forgot-password/verify-otp';
      if (isOtpRoute && tempUserId) {
        return true;
      }
      if (token || tempUserId) {
        return false;
      }
      return true;
    })
  );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const RoleGuard: CanActivateFn = (route, _state) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  const jwtHelper = new JwtHelperService();
  const token = isPlatformBrowser(platformId)
    ? localStorage.getItem('access_token')
    : null;

  if (!token) {
    return false;
  }

  try {
    const decodedToken = jwtHelper.decodeToken(token);
    const userRole = decodedToken.role;
    const allowedRoles = route.data['allowedRoles'] as string[];
    if (!allowedRoles || allowedRoles.includes(userRole)) {
      return true;
    } else {
      router.navigate(['/login']);
      return false;
    }
  } catch (error) {
    console.error('Error decoding token:', error);
    router.navigate(['/login']);
    return false;
  }
};
