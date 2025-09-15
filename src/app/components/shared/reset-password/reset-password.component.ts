import { Component, inject } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators, ValidatorFn } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AuthActions } from '../../../store/auth/auth.actions';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { selectTempUserId, selectResetToken } from '../../../store/auth/auth.reducer';
import { ResetPasswordRequestDTO } from '../../../models/auth.model';
import { combineLatest, Observable } from 'rxjs';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent {
  private store = inject(Store);
  private router = inject(Router);
  
  tempUserId$!:Observable<string | null>;
  resetToken$!:Observable<string | null>;
  resetPasswordForm!: FormGroup;

  constructor() {
    this.resetPasswordForm = new FormGroup(
      {
        newPassword: new FormControl('', [
          Validators.required,
          Validators.minLength(6),
          Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/),
        ]),
        confirmPassword: new FormControl('', [Validators.required]),
      },
      { validators: this.passwordMatchValidator() }
    );

  }

  ngOnInit():void{
    this.tempUserId$=this.store.select(selectTempUserId)
    this.resetToken$=this.store.select(selectResetToken)
  }


  onSubmit(): void {
    if (this.resetPasswordForm.valid) {
      combineLatest([this.tempUserId$, this.resetToken$])
        .pipe(first())
        .subscribe(([tempUserId, resetToken]) => {
          if (tempUserId && resetToken) {
            const { newPassword } = this.resetPasswordForm.value;
            const payload: ResetPasswordRequestDTO = {
              tempUserId,
              reset_token: resetToken,
              newPassword,
            };
            this.store.dispatch(AuthActions.resetPassword({ resetData: payload }));
          } else {
            this.router.navigate(['/forgot-password']);
          }
        });
    }
  }
  

  private passwordMatchValidator(): ValidatorFn {
    return (form: AbstractControl): { [key: string]: any } | null => {
      const password = form.get('newPassword')?.value;
      const confirmPassword = form.get('confirmPassword')?.value;
      return password && confirmPassword && password !== confirmPassword
        ? { mismatch: true }
        : null;
    };
  }
}