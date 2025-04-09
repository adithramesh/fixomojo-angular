import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';
import {  OtpRequestDTO, OtpResendRequestDTO, SignupResponseDTO, SignupUserRequestDTO } from '../../models/auth.model';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    'SignUp User': props<{ signUpData: SignupUserRequestDTO }>(),
    'SignUp Success':props<{response: SignupResponseDTO}>(),
    'SignUp Failure': props<{error: any}>(),


    'Verify Otp': props<{ otpData:OtpRequestDTO }>(),
    'Verify Otp Success': props<{ response: SignupResponseDTO }>(),
    'Verify Otp Failure': props<{ error: any }>(),

    'Resend Otp': props<{ resendData: OtpResendRequestDTO }>(),
    'Resend Otp Success': props<{ response: SignupResponseDTO }>(),
    'Resend Otp Failure': props<{ error: any }>(),
    // 'Login': props<{ loginData: any }>(),
    // 'Login Success': props<{ authResponse: AuthResponse }>(),
    // 'Login Failure': props<{ error: any }>(),

    'Logout': emptyProps(),
    'Set User': props<{ user: SignupResponseDTO | null }>(), //sets the user or null if logout.
  },
  
});


export function signUpUser(signUpUser: any): import("rxjs").OperatorFunction<any, any> {
  throw new Error('Function not implemented.');
}
// export function signUpUser(signUpUser: any): import("rxjs").OperatorFunction<any, any> {
//   throw new Error('Function not implemented.');
// }
