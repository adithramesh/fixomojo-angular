import { Component, OnInit } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AuthActions } from '../../../store/auth/auth.actions';
import { selectError, selectLoading } from '../../../store/auth/auth.reducer';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  error$!: Observable<any>;
  loading$!: Observable<boolean>;

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.error$ = this.store.select(selectError);
    this.loading$ = this.store.select(selectLoading);
    this.loginForm = new FormGroup({
      phoneNumber: new FormControl('', [
        Validators.required,
        Validators.pattern(/^\+91[\- ]?[6-9]\d{9}$/),
      ]),
      password: new FormControl('', [Validators.required]),
    });
  }

  onSubmit(): void {
    
    if (this.loginForm.valid) {
      this.store.dispatch(AuthActions.login({ loginData: this.loginForm.value }));
    } else {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
  }
}