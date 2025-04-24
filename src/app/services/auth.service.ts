import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SignupUserRequestDTO, SignupResponseDTO, OtpRequestDTO, OtpResendRequestDTO, ForgotPasswordRequestDTO, ResetPasswordRequestDTO, LoginRequestDTO} from '../models/auth.model';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http:HttpClient) { }

  private apiUrl='http://localhost:3000/auth/'
  signup(signUpData: SignupUserRequestDTO): Observable<SignupResponseDTO> {
    return this.http.post<SignupResponseDTO>(`${this.apiUrl}signup`, signUpData);
  }

  verifyOtp(otpData: OtpRequestDTO): Observable<SignupResponseDTO> {
    console.log('Sending verifyOtp request to:', `${this.apiUrl}verify-otp`, 'with data:', otpData);
    return this.http.post<SignupResponseDTO>(`${this.apiUrl}verify-otp`, otpData);
  }

  resendOtp(resendData: OtpResendRequestDTO): Observable<SignupResponseDTO> {
    return this.http.post<SignupResponseDTO>(`${this.apiUrl}resend-otp`, resendData)
  }

  forgotPassword(data: ForgotPasswordRequestDTO):Observable<SignupResponseDTO> {
    return this.http.post<SignupResponseDTO>(`${this.apiUrl}forgot-password`, data)
  }

  resetPassword(data:ResetPasswordRequestDTO):Observable<SignupResponseDTO>{
    return this.http.post<SignupResponseDTO>(`${this.apiUrl}reset-password`, data)
  } 

  login(loginData: LoginRequestDTO):Observable<SignupResponseDTO>{
    return this.http.post<SignupResponseDTO>(`${this.apiUrl}login`, loginData)
  }
}
