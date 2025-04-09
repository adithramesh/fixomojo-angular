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
    tap(()=>this.router.navigate(['/otp'])),
    
  ),
  {dispatch:false}
  )

  signUpFailure$ = createEffect(()=>
    this.actions$.pipe(ofType(AuthActions.signUpFailure),
      tap(()=>this.router.navigate(['/otp']))
    ),
    {dispatch:false}
  )

  verifyOtp$=createEffect(()=>
    this.actions$.pipe(ofType(AuthActions.verifyOtp),
      mergeMap(action=>this.authService.verifyOtp(action.otpData).pipe(
        map(response=>AuthActions.verifyOtpSuccess({response})),
        catchError(error=>of(AuthActions.verifyOtpFailure({error})))
      ))
    )
  )

  verifyOtpSuccess$=createEffect(()=>
    this.actions$.pipe(ofType(AuthActions.resendOtpSuccess),
      tap(({response})=>{localStorage.setItem('access_token',response.access_token||"");
            localStorage.setItem('refresh_token',response.refresh_token||"");
            const role=response.data?.role;
            const route=role==='user'?'/home' : role==='partner'?'/partner-dashboard' : '/admin-dashboard';
            this.router.navigate([route])
          })

    ),
    {dispatch:false}
  )

  resendOtp$=createEffect(()=>
    this.actions$.pipe(ofType(AuthActions.resendOtp),
      mergeMap(action=>this.authService.resendOtp(action.resendData).pipe(
        map((response)=>AuthActions.resendOtpSuccess({response})),
        catchError(error=>of(AuthActions.resendOtpFailure({error})))
      ))
    )
  )
  
}
