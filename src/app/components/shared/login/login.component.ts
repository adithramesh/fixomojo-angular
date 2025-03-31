import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../../../models/auth.model';

@Component({
    selector: 'app-login',
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent {
  
  loginForm= new FormGroup({
    email:new FormControl('',[Validators.required, Validators.email]),
    password : new FormControl('',[Validators.required, Validators.minLength(6)])
  })

  submitReactiveLoginForm(){
    console.log(this.loginForm.value);
    const user = this.loginForm.value as User
    // this.store.dispatch(login({user}))
  }
}
