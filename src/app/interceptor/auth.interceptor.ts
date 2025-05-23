import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError, BehaviorSubject, EMPTY } from 'rxjs';
import { catchError, switchMap, finalize, filter, take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { isPlatformBrowser } from '@angular/common';
import { RefreshTokenResponse } from '../models/auth.model';
import { PLATFORM_ID } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const platformId = inject(PLATFORM_ID);

  let isRefreshing = false;
  const refreshTokenSubject = new BehaviorSubject<string | null>(null);

  // Skip adding token for public endpoints
  const publicEndpoints = ['/signup', '/login', '/refresh-token', '/verify-otp', '/resend-otp', '/forgot-password', '/reset-password'];
  if (publicEndpoints.some(endpoint => req.url.includes(endpoint))) {
    console.log(`Interceptor: Skipping public endpoint: ${req.url}`);
    return next(req);
  }

  const token = isPlatformBrowser(platformId) ? localStorage.getItem('access_token') : null;
  console.log(`Interceptor: Token found - ${token ? 'Yes' : 'No'}`);

  let modifiedReq = req;
  if (token) {
    modifiedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(`Interceptor: Added Authorization header for ${req.url}`);
  } else {
    console.warn(`Interceptor: No token available for ${req.url}`);
  }

  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error(`Interceptor: HTTP error ${error.status} for ${req.url}`, error);
      if (error.status === HttpStatusCode.Unauthorized) {
        return handle401Error(req, next);
      }
      return throwError(() => error);
    })
  );

  function handle401Error(req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshTokenSubject.next(null);
      console.log('Interceptor: Attempting to refresh token');

      return authService.refreshToken().pipe(
        switchMap((response: RefreshTokenResponse | null) => {
          isRefreshing = false;
          if (response && response.access_token) {
            console.log('Interceptor: Token refreshed successfully');
            localStorage.setItem('access_token', response.access_token);
            refreshTokenSubject.next(response.access_token);
            return next(addToken(req, response.access_token));
          }
          console.warn('Interceptor: Token refresh failed, logging out');
          logoutUser();
          return EMPTY;
        }),
        catchError((error) => {
          isRefreshing = false;
          console.error('Interceptor: Token refresh error', error);
          logoutUser();
          return throwError(() => error);
        }),
        finalize(() => {
          isRefreshing = false;
        })
      );
    } else {
      console.log('Interceptor: Waiting for token refresh');
      return refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(token => {
          console.log('Interceptor: Using refreshed token');
          return next(addToken(req, token!));
        })
      );
    }
  }

  function addToken(req: HttpRequest<any>, token: string): HttpRequest<any> {
    return req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  function logoutUser(): void {
    console.log('Interceptor: Logging out user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    router.navigate(['/login']);
  }
};