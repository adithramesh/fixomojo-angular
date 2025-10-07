import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { SignupUserRequestDTO, SignupResponseDTO, OtpRequestDTO, OtpResendRequestDTO, ForgotPasswordRequestDTO, ResetPasswordRequestDTO, LoginRequestDTO, RefreshTokenResponse} from '../models/auth.model';
import { catchError, EMPTY, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
   private platformId = inject(PLATFORM_ID);
   private http = inject(HttpClient)
   private router = inject(Router);

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

  refreshToken(): Observable<RefreshTokenResponse> {  // Drop | null—throw or return response
    if (!isPlatformBrowser(this.platformId)) {
      console.warn('Refresh token attempted on server-side—skipping');
      return EMPTY;  // Or throwError(() => new Error('SSR: Cannot refresh'));
    }

    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      console.warn('No refresh token found—cannot refresh');
      return throwError(() => new Error('No refresh token found'));
    }
    
    const body = { refreshToken };
    return this.http.post<RefreshTokenResponse>(`${this.apiUrl}refresh-token`, body).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Refresh token request failed:', error);
        // Optional: Clear tokens on backend 401 (e.g., invalid refresh)
        if (error.status === 401) {
          this.logoutUser();  // If you have a logout method to clear ls/nav
        }
        return throwError(() => error);
      })
    );
  }

    logoutUser(): void {
    console.log('Interceptor: Logging out user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.router.navigate(['/login']);
  }
}
