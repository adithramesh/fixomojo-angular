import { Routes } from '@angular/router';
import { SignUpComponent } from './components/shared/sign-up/sign-up.component';
import { OtpComponent } from './components/shared/otp/otp.component';
import { LoginComponent } from './components/shared/login/login.component';
import { ForgotPasswordComponent } from './components/shared/forgot-password/forgot-password.component';
import { HomeComponent } from './components/user/home/home.component';
import { PartnerDashboardComponent } from './components/partner/partner-dashboard/partner-dashboard.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';
import { ResetPasswordComponent } from './components/shared/reset-password/reset-password.component';

export const routes: Routes = [
    { path:"signup", component:SignUpComponent},
    { path: 'signup/verify-otp', component: OtpComponent, data: { context: 'signup' } },
    { path: 'login', component: LoginComponent },
    { path:'forgot-password', component:ForgotPasswordComponent },
    { path: 'forgot-password/verify-otp', component: OtpComponent, data: { context: 'forgot-password' } },
    { path: 'reset-password', component: ResetPasswordComponent},
    { path: 'home', component: HomeComponent }, // For 'user' role after OTP verification
    { path: 'partner-dashboard', component: PartnerDashboardComponent }, // For 'partner' role
    { path: 'admin-dashboard', component: AdminDashboardComponent }, // For 'admin' role
    { path: '', redirectTo: '/signup', pathMatch: 'full' }, // Default route
    { path: '**', redirectTo: '/signup' }, // Wildcard route for invalid paths
    
];
