import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {  SignupUserRequestDTO, SignupResponseDTO, OtpRequestDTO, OtpResendRequestDTO} from '../models/auth.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http:HttpClient) { }

  private apiUrl='http://localhost:3000/auth/'
  signup(signUpData: SignupUserRequestDTO): Observable<SignupResponseDTO> {
    return this.http.post<SignupResponseDTO>(`${this.apiUrl}/signup`, signUpData);
  }

  verifyOtp(otpData: OtpRequestDTO): Observable<SignupResponseDTO> {
    return this.http.post<SignupResponseDTO>(`${this.apiUrl}/verify-otp`, otpData);
  }

  resendOtp(resendData: OtpResendRequestDTO): Observable<SignupResponseDTO> {
    return this.http.post<SignupResponseDTO>(`${this.apiUrl}/resend-otp`, resendData);
  }
}
