// import { Component, OnInit } from '@angular/core';
// import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
// import { Store } from '@ngrx/store';
// import { AuthActions } from '../../../store/auth/auth.actions';
// import { CommonModule } from '@angular/common';
// import { Router } from '@angular/router';

// @Component({
//   selector: 'app-forgot-password',
//   standalone: true,
//   imports: [CommonModule, ReactiveFormsModule],
//   templateUrl: './forgot-password.component.html',
//   styleUrls: ['./forgot-password.component.scss']
// })
// export class ForgotPasswordComponent implements OnInit {
//   forgotPasswordForm!: FormGroup;

//   constructor(private store: Store, private router: Router) {}

//   ngOnInit(): void {
//     this.forgotPasswordForm = new FormGroup({
//       phoneNumber: new FormControl('', [
//         Validators.required,
//         Validators.pattern(/^\+91[\- ]?[6-9]\d{9}$/),
//       ]),
//     });
//   }

//   onSubmit() {
//     if (this.forgotPasswordForm.valid) {
//       const { phoneNumber } = this.forgotPasswordForm.value;
//       this.store.dispatch(AuthActions.forgotPassword( phoneNumber ));
//     }
//   }
// }

import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AuthActions } from '../../../store/auth/auth.actions';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { selectLoading } from '../../../store/auth/auth.reducer'; // Import loading selector
import { Observable } from 'rxjs';
import { ForgotPasswordRequestDTO } from '../../../models/auth.model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm!: FormGroup;
  loading$: Observable<boolean>; // Observable for loading state

  constructor(private store: Store, private router: Router) {
    this.loading$ = this.store.select(selectLoading); // Initialize in constructor for early subscription
  }

  ngOnInit(): void {
    this.forgotPasswordForm = new FormGroup({
      phoneNumber: new FormControl('', [
        Validators.required,
        Validators.pattern(/^\+91[\- ]?[6-9]\d{9}$/), // Match login/signup
      ]),
    });
    // Debug validity
    // console.log('Initial form validity:', this.forgotPasswordForm.valid);
    // this.forgotPasswordForm.valueChanges.subscribe(value => {
    //   console.log('Form value changed:', value, 'Validity:', this.forgotPasswordForm.valid);
    // });
  }

  onSubmit() {
    if (this.forgotPasswordForm.valid) {
      const { phoneNumber } = this.forgotPasswordForm.value;
      console.log('Dispatching phoneNumber:', phoneNumber);
      const payload: ForgotPasswordRequestDTO = { phoneNumber }; 
      console.log('Dispatching payload:', payload);
      this.store.dispatch(AuthActions.forgotPassword({ data: payload })); 
    }
  }
}