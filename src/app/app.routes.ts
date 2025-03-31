import { Routes } from '@angular/router';
import { SignUpComponent } from './components/shared/sign-up/sign-up.component';
import { LoginComponent } from './components/shared/login/login.component';

export const routes: Routes = [
    {path:"sign-up", component:SignUpComponent},
    {path:"login", component:LoginComponent}
];
