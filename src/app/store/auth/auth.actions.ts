import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';

import { Auth } from './auth.model';
import { AdminSignupData, PartnerSignUpData, User, UserSignUpData } from '../../models/auth.model';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    'SignUp User': props<{ signUpData: UserSignUpData }>(),
    'SignUp Partner': props<{ signUpData: PartnerSignUpData }>(),
    'SignUp Admin': props<{ signUpData: AdminSignupData }>(),
    'SignUp Success':props<{role: string | null}>(),
    'SignUp Failure': props<{error: any}>(),

    'Aadhar Verification': props<{partnerId:string}>(),
    'Aadhar Verification Success':emptyProps(),
    'Aadhar Verification Error': props<{error:any}>(),

    'Send Otp': props<{ userId: string }>(),
    'Send Otp Success': emptyProps(),
    'Send Otp Failure': props<{ error: any }>(),


    'Verify Otp': props<{ userId: string; otp: string }>(),
    'Verify Otp Success': props<{ user: User }>(),
    'Verify Otp Failure': props<{ error: any }>(),

    // 'Login': props<{ loginData: any }>(),
    // 'Login Success': props<{ authResponse: AuthResponse }>(),
    // 'Login Failure': props<{ error: any }>(),

    'Logout': emptyProps(),
    'Set User': props<{ user: User | null }>(), //sets the user or null if logout.
  },
  
});
