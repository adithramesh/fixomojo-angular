import { CommonModule } from '@angular/common';
import { Component, Inject, Input } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
export type UserType = 'user' | 'partner' | 'admin';
@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css',
})
export class SignUpComponent {

  // isSubmitting$!: Observable<boolean>;
  // message$!: Observable<string | null>;
  // token$!: Observable<string | null>;
  // user$!: Observable<User | null>;

  // constructor(private store: Store) {}

  // ngOnInit(): void {
  //   // Use the selectors to get the observables
  //   this.isSubmitting$ = this.store.select(selectIsSubmitting);
  //   this.message$ = this.store.select(selectMessage);
  //   this.token$ = this.store.select(selectToken);
  //   this.user$ = this.store.select(selectUser);
  // }

  signUpForm!: FormGroup;
  userType: UserType = 'admin';
  subtitleText?: string;
  // constructor(private store: Store) {}

  ngOnInit(): void {
    this.initForm();
  }

  get subtitle(): string {
    return this.subtitleText || this.getDefaultSubtitle();
  }

  private getDefaultSubtitle(): string {
    const subtitles = {
      user: 'User SignUp',
      partner: 'Partner SignUp',
      admin: 'Admin SignUp',
    };
    return subtitles[this.userType];
  }

  private initForm(): void {
    // Base form controls
    const baseControls = {
      username: new FormControl('', [
        Validators.required,
        Validators.minLength(4),
        Validators.pattern(/^[a-zA-Z0-9_]+$/),
      ]),
      email: new FormControl('', [Validators.required, Validators.email]),
      phoneNumber: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[0-9]{10}$/),
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/),
      ]),
      confirmPassword: new FormControl('', [Validators.required]),
    };

    // User type specific controls
    const additionalControls = this.getUserTypeSpecificControls();

    // Create form group with all controls
    this.signUpForm = new FormGroup(
      {
        ...baseControls,
        ...additionalControls,
      },
      { validators: this.passwordMatchValidator }
    );
  }

  private getUserTypeSpecificControls() {
    switch (this.userType) {
      case 'partner':
        return {
          serviceType: new FormControl('', Validators.required),
          aadharCardNumber: new FormControl('', Validators.required),
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

      // Dispatch signup action to global store
      // this.store.dispatch(
      //   signupStart({
      //     payload: {
      //       userType: this.userType,
      //       userData: formData,
      //     },
      //   })
      // );
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.signUpForm.controls).forEach((key) => {
        const control = this.signUpForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  // Custom validator for password match
  // private passwordMatchValidator(form: FormGroup): {[key: string]: any} | null {
  //   const password = form.get('password');
  //   const confirmPassword = form.get('confirmPassword');

  //   return password && confirmPassword && password.value !== confirmPassword.value
  //     ? { 'passwordMismatch': true }
  //     : null;
  // }
  private passwordMatchValidator(): ValidatorFn {
    return (form: AbstractControl): { [key: string]: any } | null => {
      const password = form.get('password');
      const confirmPassword = form.get('confirmPassword');

      return password &&
        confirmPassword &&
        password.value !== confirmPassword.value
        ? { passwordMismatch: true }
        : null;
    };
  }
}
