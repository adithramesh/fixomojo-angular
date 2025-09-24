import { createActionGroup, emptyProps, props } from '@ngrx/store';
import {  ForgotPasswordRequestDTO, LoginRequestDTO, OtpRequestDTO, OtpResendRequestDTO, ResetPasswordRequestDTO, SignupResponseDTO, SignupUserRequestDTO } from '../../models/auth.model';
import { HttpErrorResponse } from '@angular/common/http';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    'SignUp User': props<{ signUpData: SignupUserRequestDTO }>(),
    'SignUp Success':props<{response: SignupResponseDTO}>(),
    'SignUp Failure': props<{error: HttpErrorResponse}>(),

    'Verify Otp': props<{ otpData:OtpRequestDTO }>(),
    'Verify Otp Success': props<{ response: SignupResponseDTO }>(),
    'Verify Otp Failure': props<{ error: HttpErrorResponse }>(),

    'Resend Otp': props<{ resendData: OtpResendRequestDTO }>(),
    'Resend Otp Success': emptyProps(),
    'Resend Otp Failure': props<{ error: HttpErrorResponse }>(),

    'Forgot Password': props<{ data:ForgotPasswordRequestDTO }>(),
    'Forgot Password Success': props<{ response: SignupResponseDTO }>(),
    'Forgot Password Failure': props<{ error: HttpErrorResponse }>(),

    'Reset Password': props<{ resetData:ResetPasswordRequestDTO }>(),
    'Reset Password Success': props<{ response: SignupResponseDTO }>(),
    'Reset Password Failure': props<{ error: HttpErrorResponse }>(),

    'Login': props<{ loginData: LoginRequestDTO }>(),
    'Login Success': props<{ response: SignupResponseDTO }>(),
    'Login Failure': props<{ error: HttpErrorResponse }>(),

    'Logout': emptyProps(),
    'Set User': props<{ user: SignupResponseDTO | null }>(), 

    'Update Username':  props<{ username: string }>()
  },
  
});


// export function signUpUser(signUpUser: any): import("rxjs").OperatorFunction<any, any> {
//   throw new Error('Function not implemented.');
// }
