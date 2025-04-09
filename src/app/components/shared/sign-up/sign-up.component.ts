import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Store } from '@ngrx/store';
import { SignupUserRequestDTO } from '../../../models/auth.model';
import { AuthActions } from '../../../store/auth/auth.actions';
 
@Component({
  selector: 'app-sign-up',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css',
})
export class SignUpComponent implements OnInit {
  signUpForm!: FormGroup;
  subtitleText?: string;

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.initForm();
  }

  get subtitle(): string {
    return this.subtitleText || this.getDefaultSubtitle();
  }

  private getDefaultSubtitle(): string {
    const subtitles: { [key: string]: string } = {
      user: 'User SignUp',
      partner: 'Partner SignUp',
      admin: 'Admin SignUp',
    };
  
    const role = this.signUpForm.get('role')?.value;
  
    if (role && (role === 'user' || role === 'partner' || role === 'admin')) {
      return subtitles[role as keyof typeof subtitles]; 
    } else {
      return 'SignUp';
    }
  }

  private initForm(): void {
    const baseControls = {
      username: new FormControl('', [
        Validators.required,
        Validators.minLength(4),
        Validators.pattern(/^[a-zA-Z0-9_]+$/),
      ]),
      email: new FormControl('', [Validators.required, Validators.email]),
      phoneNumber: new FormControl('', [
        Validators.required,
        Validators.pattern('^(\\+?\d{1,4}[\s-])?(?!0+\s+,?$)\\d{10}\s*,?$'),
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/),
      ]),
      confirmPassword: new FormControl('', [Validators.required]),
      role: new FormControl('user', Validators.required), // Default role
    };

    const additionalControls = this.getUserTypeSpecificControls();

    this.signUpForm = new FormGroup(
      {
        ...baseControls,
        ...additionalControls,
      },
      { validators: this.passwordMatchValidator }
    );
  }

  private getUserTypeSpecificControls() {
    const role = this.signUpForm?.get('role')?.value; // Get role from form

    switch (role) {
      case 'partner':
        return {
          serviceType: new FormControl('', Validators.required),
          // aadharCardNumber: new FormControl('', Validators.required), // Removed
        };
      case 'admin':
        return {
          adminCode: new FormControl('', Validators.required),
          department: new FormControl('', Validators.required),
        };
      default:
        return {};
    }
  }

  submitReactiveSignUpForm() {
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
      Object.keys(this.signUpForm.controls).forEach((key) => {
        const control = this.signUpForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  private passwordMatchValidator(): ValidatorFn {
    return (form: AbstractControl): { [key: string]: any } | null => {
      const password = form.get('password')?.value;
      const confirmPassword = form.get('confirmPassword')?.value;
      return password && confirmPassword && password !== confirmPassword
        ? { passwordMismatch: true }
        : null;
    };
  }
}