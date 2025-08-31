import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {  ForgotPasswordRequestDTO, LoginRequestDTO, OtpRequestDTO, OtpResendRequestDTO, ResetPasswordRequestDTO, SignupResponseDTO, SignupUserRequestDTO } from '../../models/auth.model';

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
    'Resend Otp Success': emptyProps(),
    'Resend Otp Failure': props<{ error: any }>(),

    'Forgot Password': props<{ data:ForgotPasswordRequestDTO }>(),
    'Forgot Password Success': props<{ response: SignupResponseDTO }>(),
    'Forgot Password Failure': props<{ error: any }>(),

    'Reset Password': props<{ resetData:ResetPasswordRequestDTO }>(),
    'Reset Password Success': props<{ response: SignupResponseDTO }>(),
    'Reset Password Failure': props<{ error: any }>(),

    'Login': props<{ loginData: LoginRequestDTO }>(),
    'Login Success': props<{ response: SignupResponseDTO }>(),
    'Login Failure': props<{ error: any }>(),

    'Logout': emptyProps(),
    'Set User': props<{ user: SignupResponseDTO | null }>(), //sets the user or null if logout.
  },
  
});


export function signUpUser(signUpUser: any): import("rxjs").OperatorFunction<any, any> {
  throw new Error('Function not implemented.');
}
