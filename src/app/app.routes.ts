import { Routes } from '@angular/router';
import { SignUpComponent } from './components/shared/sign-up/sign-up.component';
import { OtpComponent } from './components/shared/otp/otp.component';
import { LoginComponent } from './components/shared/login/login.component';
import { ForgotPasswordComponent } from './components/shared/forgot-password/forgot-password.component';
import { HomeComponent } from './components/user/home/home.component';
import { PartnerDashboardComponent } from './components/partner/partner-dashboard/partner-dashboard.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';
import { ResetPasswordComponent } from './components/shared/reset-password/reset-password.component';
import { dontGoBack, RoleGuard } from './guards/auth.guard';
import { AddServiceComponent } from './components/admin/add-service/add-service.component';
import { ServiceManagementComponent } from './components/admin/service-management/service-management.component';
import { PartnerManagementComponent } from './components/admin/partner-management/partner-management.component';
import { UserManagementComponent } from './components/admin/user-management/user-management.component';
import { AddSubServiceComponent } from './components/admin/add-sub-service/add-sub-service.component';
import { SubServiceManagementComponent } from './components/admin/sub-service-management/sub-service-management.component';
import { ServiceDetailsComponent } from './components/user/service-details/service-details.component';
import { BookingServiceComponent } from './components/user/booking-service/booking-service.component';
import { LocationComponent } from './components/partner/location/location.component';
import { TimeSlotsComponent } from './components/partner/time-slots/time-slots.component';
import { PaymentSuccessComponent } from './components/user/payment-success/payment-success.component';
import { MyBookingsComponent } from './components/user/my-bookings/my-bookings.component';
import { WalletComponent } from './components/shared/wallet/wallet.component';
import { TasksComponent } from './components/partner/tasks/tasks.component';
import { ActivitiesComponent } from './components/admin/activities/activities.component';
import { UserProfileComponent } from './components/shared/user-profile/user-profile.component';
import { VideoCallComponent } from './components/shared/video-call/video-call.component';
import { OfferManagementComponent } from './components/admin/offer-management/offer-management.component';
import { OfferFormComponent } from './components/admin/offer-form/offer-form.component';
import { UnauthorizedComponent } from './components/shared/unauthorized/unauthorized.component';
import { NotFoundComponent } from './components/shared/not-found/not-found.component';

export const routes: Routes = [
    //user
    { path: "signup", component:SignUpComponent},
    { path: 'signup/verify-otp', component: OtpComponent, data: { context: 'signup' }, canActivate:[dontGoBack]},
    { path: 'login', component: LoginComponent },
    { path: 'forgot-password', component:ForgotPasswordComponent },
    { path: 'forgot-password/verify-otp', component: OtpComponent, data: { context: 'forgot-password' }, canActivate:[dontGoBack] },
    { path: 'reset-password', component: ResetPasswordComponent},
    { path: 'home', component: HomeComponent,canActivate:[RoleGuard], data: { allowedRoles: ['user'] } }, 
    { path: 'services', component: ServiceDetailsComponent, canActivate: [RoleGuard], data: { allowedRoles: ['user'] } },
    { path: 'book-service', component: BookingServiceComponent, canActivate: [RoleGuard], data: { allowedRoles: ['user'] } },
    { path: 'payment-success', component: PaymentSuccessComponent, canActivate: [RoleGuard], data: { allowedRoles: ['user'] } },
    { path: 'my-bookings', component:MyBookingsComponent , canActivate: [RoleGuard], data: { allowedRoles: ['user'] } },
    { path: 'user-wallet', component: WalletComponent, canActivate: [RoleGuard], data: { allowedRoles: ['user'], role: 'user'} },

    //admin
    { path: 'admin-dashboard', component: AdminDashboardComponent,  canActivate: [RoleGuard], data: { allowedRoles: ['admin'] } },
    { path: 'user-management', component: UserManagementComponent, canActivate: [RoleGuard], data: { allowedRoles: ['admin'] } },
    { path: 'partner-management', component: PartnerManagementComponent, canActivate: [RoleGuard], data: { allowedRoles: ['admin'] } },
    { path: 'service-management', component: ServiceManagementComponent, canActivate: [RoleGuard], data: { allowedRoles: ['admin'] } },
    { path: 'sub-service-management', component: SubServiceManagementComponent, canActivate: [RoleGuard], data: { allowedRoles: ['admin'] } },
    { path: 'add-service', component: AddServiceComponent, canActivate: [RoleGuard], data: { allowedRoles: ['admin'] } },
    { path: 'edit-service/:id', component: AddServiceComponent, canActivate: [RoleGuard], data: { allowedRoles: ['admin'] } },
    { path: 'sub-service', component: AddSubServiceComponent, canActivate: [RoleGuard], data: { allowedRoles: ['admin'] } },
    { path: 'edit-sub-service/:id', component: AddSubServiceComponent, canActivate: [RoleGuard], data: { allowedRoles: ['admin'] } },
    { path: 'admin-wallet', component: WalletComponent, canActivate: [RoleGuard], data: { allowedRoles: ['admin'], role: 'admin'} },
    { path: 'activities', component: ActivitiesComponent, canActivate: [RoleGuard], data: { allowedRoles: ['admin']} },
    { path: 'offers', component: OfferManagementComponent, canActivate: [RoleGuard], data: { allowedRoles: ['admin'] } },
    { path: 'offers/add', component: OfferFormComponent, canActivate: [RoleGuard], data: { allowedRoles: ['admin'] } },
    { path: 'offers/edit/:id', component: OfferFormComponent, canActivate: [RoleGuard], data: { allowedRoles: ['admin'] } },
    //partner
    { path: 'partner-dashboard', component: PartnerDashboardComponent, canActivate: [RoleGuard], data: { allowedRoles: ['partner'] }}, 
    { path: 'location', component: LocationComponent, canActivate: [RoleGuard], data: { allowedRoles: ['partner'] } }, 
    { path: 'time-slots', component: TimeSlotsComponent, canActivate: [RoleGuard], data: { allowedRoles: ['partner'] } },
    { path: 'partner-wallet', component: WalletComponent, canActivate: [RoleGuard], data: { allowedRoles: ['partner'], role: 'partner'} },
    { path: 'tasks', component: TasksComponent, canActivate: [RoleGuard], data: { allowedRoles: ['partner', 'admin']} },

    //shared
    { path: 'my-profile', component: UserProfileComponent, canActivate: [RoleGuard], data: { allowedRoles: ['partner', 'user']} },
    { path: 'video-call/:id', component: VideoCallComponent, canActivate: [RoleGuard], data: { allowedRoles: ['admin']} },
    { path: 'video-call/join/:callId', component: VideoCallComponent, canActivate: [RoleGuard], data: { allowedRoles: ['partner', 'admin']} },
    { path: 'unauthorized', component: UnauthorizedComponent},
    { path: '', redirectTo: '/signup', pathMatch: 'full' }, // Default route
    { path: '**', component: NotFoundComponent }, // Wildcard route for invalid paths
    
];
