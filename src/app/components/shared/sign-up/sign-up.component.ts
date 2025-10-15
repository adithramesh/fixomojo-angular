import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { SignupUserRequestDTO } from '../../../models/auth.model';
import { AuthActions } from '../../../store/auth/auth.actions';
import { ApiError, selectError, selectLoading } from '../../../store/auth/auth.reducer';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AsyncPipe, RouterModule],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
})
export class SignUpComponent implements OnInit {
  signUpForm!: FormGroup;
  subtitleText?: string;
  error$!: Observable<ApiError | null>;
  loading$!: Observable<boolean>;
  private store = inject(Store)


  ngOnInit(): void {
  
    this.error$ = this.store.select(selectError);
    this.loading$ = this.store.select(selectLoading);

    this.initBaseForm();
    this.updateFormForRole(this.signUpForm.get('role')?.value || 'user');

   
    this.signUpForm.get('role')?.valueChanges.subscribe(role => {
      this.updateFormForRole(role);
    });
  }

  get subtitle(): string {
    return this.subtitleText || this.getDefaultSubtitle();
  }


 private getDefaultSubtitle(): string {
    const subtitles: Record<'user' | 'partner' | 'admin', string> = {
      user: 'User SignUp',
      partner: 'Partner SignUp',
      admin: 'Admin SignUp',
    };

    const role = this.signUpForm.get('role')?.value as 'user' | 'partner' | 'admin' | null;

    return role && subtitles[role] ? subtitles[role] : 'SignUp';
  }



  private initBaseForm(): void {
    this.signUpForm = new FormGroup(
      {
        username: new FormControl('', [
          Validators.required,
          Validators.minLength(4),
          Validators.pattern(/^[a-zA-Z0-9_]+$/),
        ]),
        email: new FormControl('', [Validators.required, Validators.email]),
        phoneNumber: new FormControl('', [
          Validators.required,
          // eslint-disable-next-line no-useless-escape
          Validators.pattern(/^\+91[\- ]?[6-9]\d{9}$/),
        ]),
        password: new FormControl('', [
          Validators.required,
          Validators.minLength(6),
          Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/),
        ]),
        confirmPassword: new FormControl('', [Validators.required]),
        role: new FormControl('user', Validators.required),
      },
      { validators: this.passwordMatchValidator }
    );
  }

  private updateFormForRole(role: string): void {
    ['serviceType', 'adminCode', 'department'].forEach(control => {
      if (this.signUpForm.get(control)) {
        this.signUpForm.removeControl(control);
      }
    });
    switch (role) {
      case 'partner':
        this.signUpForm.addControl('serviceType', new FormControl('', Validators.required));
        break;
      case 'admin':
        this.signUpForm.addControl('adminCode', new FormControl('', Validators.required));
        this.signUpForm.addControl('department', new FormControl('', Validators.required));
        break;
    }
  }



  passwordMatchValidator(form: AbstractControl): Record<string, boolean> | null {
    const formGroup = form as FormGroup;
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;

    return password && confirmPassword && password === confirmPassword
      ? null
      : { mismatch: true };
  }


  submitReactiveSignUpForm(): void {
    if (this.signUpForm.valid) {
      const formData = this.signUpForm.value;
      const signUpData: SignupUserRequestDTO = {
        username: formData.username,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        role: formData.role,
        serviceType: formData.serviceType,
        adminCode: formData.adminCode,
        department: formData.department,
      };
      this.store.dispatch(AuthActions.signUpUser({ signUpData }));
    } else {
      Object.keys(this.signUpForm.controls).forEach(key => {
        this.signUpForm.get(key)?.markAsTouched();
      });
    }
  }
}