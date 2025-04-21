import { Component, inject } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators, ValidatorFn } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AuthActions } from '../../../store/auth/auth.actions';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { selectTempUserId, selectResetToken } from '../../../store/auth/auth.reducer';
import { ResetPasswordRequestDTO } from '../../../models/auth.model';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent {
  private store = inject(Store);
  router = inject(Router);
  tempUserId$ = this.store.select(selectTempUserId);
  resetToken$ = this.store.select(selectResetToken);
  resetPasswordForm!: FormGroup;

  constructor() {
    this.resetPasswordForm = new FormGroup(
      {
        newPassword: new FormControl('', [
          Validators.required,
          Validators.minLength(6),
          Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/),
        ]),
        confirmPassword: new FormControl('', [Validators.required]),
      },
      { validators: this.passwordMatchValidator() }
    );
  }

  onSubmit(tempUserId: string | null, resetToken: string | null) {
    if (this.resetPasswordForm.valid && tempUserId && resetToken) {
      const { newPassword } = this.resetPasswordForm.value;
      const payload: ResetPasswordRequestDTO = {
        tempUserId,
        reset_token: resetToken,
        newPassword,
      };
      console.log("payload", payload);
      this.store.dispatch(AuthActions.resetPassword({ resetData: payload }));
    } else {
      console.warn("Invalid form or missing tempUserId/resetToken");
      this.router.navigate(['/forgot-password']);
    }
  }

  private passwordMatchValidator(): ValidatorFn {
    return (form: AbstractControl): { [key: string]: any } | null => {
      const password = form.get('newPassword')?.value;
      const confirmPassword = form.get('confirmPassword')?.value;
      return password && confirmPassword && password !== confirmPassword
        ? { passwordMismatch: true }
        : null;
    };
  }
}