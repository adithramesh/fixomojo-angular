import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, concatMap, mergeMap, tap } from 'rxjs/operators';
import { Observable, EMPTY, of } from 'rxjs';
import { AuthActions } from './auth.actions';
// import * as AuthActions from "./auth.actions"
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthEffects {
  actions$ = inject(Actions);
  router = inject(Router);
  authService = inject(AuthService);

  signUpUser$ = createEffect(()=>
     this.actions$.pipe(
      ofType(AuthActions.signUpUser),
      mergeMap(action =>{
        console.log('Sign Up Action:', action);
        return this.authService.signup(action.signUpData).pipe(
          map(response => { console.log('Sign Up Response:', response);
            return AuthActions.signUpSuccess({response}) }),
          catchError(error=>of(AuthActions.signUpFailure({error})))
      )
      })
    )
  )

  signUpSuccess$= createEffect(()=>
  this.actions$.pipe(
    ofType(AuthActions.signUpSuccess),
    tap(()=>this.router.navigate(['/signup/verify-otp'])),
    
  ),
  {dispatch:false}
  )

  signUpFailure$ = createEffect(()=>
    this.actions$.pipe(ofType(AuthActions.signUpFailure),
      tap(()=>this.router.navigate(['/signup']))
    ),
    {dispatch:false}
  )

  verifyOtp$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.verifyOtp),
      tap(action => console.log('verifyOtp$ triggered with action:', action)), // Log the action
      mergeMap(action =>
        this.authService.verifyOtp(action.otpData).pipe(
          tap(response => console.log('verifyOtp$ HTTP response:', response)), // Log the response
          map(response => AuthActions.verifyOtpSuccess({ response })),
          catchError(error => {
            console.log('verifyOtp$ HTTP error:', error); // Log any errors
            return of(AuthActions.verifyOtpFailure({ error }));
          })
        )
      )
    )
  );


  verifyOtpSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.verifyOtpSuccess),
        tap(action => {
          const { response } = action;
          console.log('verifyOtpSuccess response:', response);

          if (response.access_token && response.refresh_token && response.data) {
            // Signup flow
            localStorage.setItem('access_token', response.access_token);
            localStorage.setItem('refresh_token', response.refresh_token);
            const role = response.data.role;
            console.log("role inside verfy otp success effect is ", role);
            switch (role) {
              case 'user':
                this.router.navigate(['/home']);
                break;
              case 'partner':
                this.router.navigate(['/partner-dashboard']);
                break;
              case 'admin':
                this.router.navigate(['/admin-dashboard']);
                break;
              default:
                this.router.navigate(['/signup']);
            }
          } else if (response.reset_token) {
            // Forgot password flow
            localStorage.setItem('reset_token', response.reset_token); // Temporary storage
            this.router.navigate(['/reset-password']);
          } else {
            console.error('Unexpected response format');
            this.router.navigate(['/signup']); // Fallback
          }
        })
      ),
    { dispatch: false }
  );

  resendOtp$=createEffect(()=>
    this.actions$.pipe(ofType(AuthActions.resendOtp),
      mergeMap(action=>this.authService.resendOtp(action.resendData).pipe(
        map((response)=>AuthActions.resendOtpSuccess({response})),
        catchError(error=>of(AuthActions.resendOtpFailure({error})))
      ))
    )
  )

  resendOtpSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.resendOtpSuccess),
        tap(action => {
          const { response } = action;
          console.log('resendOtpSuccess response:', response);
          // No navigation, stay on current page (/signup/verify-otp)
          // Optionally update UI (e.g., timer or message) via store
        })
      ),
    { dispatch: false }
  );

  forgotPassword$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.forgotPassword),
      tap(action => console.log('forgotPassword$ triggered with action:', action)),
      mergeMap(action =>
        this.authService.forgotPassword(action.data).pipe(
          map(response => AuthActions.forgotPasswordSuccess({ response })),
          catchError(error => of(AuthActions.forgotPasswordFailure({ error })))
        )
      )
    )
  );

  forgotPasswordSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.forgotPasswordSuccess),
        tap(action => console.log('forgotPasswordSuccess$ triggered with action:', action)),
        tap(() => this.router.navigate(['forgot-password/verify-otp']))
      ),
    { dispatch: false }
  );
  
  resetPassword$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.resetPassword),
      mergeMap(action =>
        this.authService.resetPassword(action.resetData).pipe(
          map(response => AuthActions.resetPasswordSuccess({ response })),
          catchError(error => of(AuthActions.resetPasswordFailure({ error })))
        )
      )
    )
  );

  resetPasswordSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.resetPasswordSuccess),
        tap(() => {
          localStorage.removeItem('reset_token'); 
          this.router.navigate(['/login']);
        })
      ),
    { dispatch: false }
  );

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      mergeMap(action =>
        this.authService.login(action.loginData).pipe(
          map(response => AuthActions.loginSuccess({ response })),
          catchError(error => of(AuthActions.loginFailure({ error })))
        )
      )
    )
  );

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(({ response }) => {
          localStorage.setItem('access_token', response.access_token || '');
          localStorage.setItem('refresh_token', response.refresh_token || '');
          const role = response.data?.role;
          const route =
            role === 'user' ? '/home' :
            role === 'partner' ? '/partner-dashboard' :
            '/admin-dashboard';
          this.router.navigate([route]);
        })
      ),
    { dispatch: false }
  );

  loginFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginFailure),
        tap(() => this.router.navigate(['/login']))
      ),
    { dispatch: false }
  );
}
