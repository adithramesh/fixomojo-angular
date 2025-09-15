import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SignupUserRequestDTO, SignupResponseDTO, OtpRequestDTO, OtpResendRequestDTO, ForgotPasswordRequestDTO, ResetPasswordRequestDTO, LoginRequestDTO, RefreshTokenResponse} from '../models/auth.model';
import { catchError, Observable, of, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http:HttpClient) { }

  private apiUrl=`${environment.BACK_END_API_URL}/auth/`
  signup(signUpData: SignupUserRequestDTO): Observable<SignupResponseDTO> {
    return this.http.post<SignupResponseDTO>(`${this.apiUrl}signup`, signUpData);
  }

  verifyOtp(otpData: OtpRequestDTO): Observable<SignupResponseDTO> {
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

  refreshToken(): Observable<RefreshTokenResponse | null> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token found'));
    }
    
    const body = { refreshToken };
    return this.http.post<RefreshTokenResponse>(`${this.apiUrl}refresh-token`, body).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }
}
