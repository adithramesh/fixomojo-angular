import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AuthActions } from '../../../store/auth/auth.actions';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { selectLoading } from '../../../store/auth/auth.reducer'; 
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
  loading$: Observable<boolean>; 

  constructor(private store: Store, private router: Router) {
    this.loading$ = this.store.select(selectLoading); 
  }

  ngOnInit(): void {
    this.forgotPasswordForm = new FormGroup({
      phoneNumber: new FormControl('', [
        Validators.required,
        Validators.pattern(/^\+91[\- ]?[6-9]\d{9}$/), 
      ]),
    });

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