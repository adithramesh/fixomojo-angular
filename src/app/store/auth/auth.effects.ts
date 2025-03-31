import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, concatMap, mergeMap } from 'rxjs/operators';
import { Observable, EMPTY, of } from 'rxjs';
import { AuthActions } from './auth.actions';
// import * as AuthActions from './auth.actions';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthEffects {
  actions$ = inject(Actions);
  router = inject(Router);
  authService = inject(AuthService);

  authAuths$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(
        AuthActions.signUpUser,
        AuthActions.signUpPartner,
        AuthActions.signUpUser
      ),
      mergeMap((action) =>{
        const signUpData=action.signUpData
        return this.authService.signUp(signUpData).pipe(
          map((data) => AuthActions.signUpSuccess({ role:data.role })),
          catchError((error) => of(AuthActions.signUpFailure({ error })))
        )
  })
    );
  });

}
