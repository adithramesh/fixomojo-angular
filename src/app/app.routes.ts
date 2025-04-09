import { Routes } from '@angular/router';
import { SignUpComponent } from './components/shared/sign-up/sign-up.component';
import { OtpComponent } from './components/shared/otp/otp.component';
// import { LoginComponent } from './components/shared/login/login.component';

export const routes: Routes = [
    {path:"signup", component:SignUpComponent},
    { path: 'otp', component: OtpComponent },
    // { path: 'home', component: HomeComponent }, // For 'user' role after OTP verification
    // { path: 'partner-dashboard', component: PartnerDashboardComponent }, // For 'partner' role
    // { path: 'admin-dashboard', component: AdminDashboardComponent }, // For 'admin' role
    { path: '', redirectTo: '/signup', pathMatch: 'full' }, // Default route
    { path: '**', redirectTo: '/signup' }, // Wildcard route for invalid paths
];
