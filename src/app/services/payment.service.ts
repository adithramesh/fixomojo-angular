import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
  bookingData?: any; 
}

export interface WalletResponse {
  success: boolean;
  message: string;
}

export interface BookingDetailsResponse {
  success: boolean;
  message: string;
  data?: any; 
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = environment.BACK_END_API_URL;

  constructor(private http: HttpClient) { }

  verifyCardPayment(sessionId: string): Observable<VerifyPaymentResponse> {
    return this.http.get<any>(`${this.apiUrl}/user/verify-payment?session_id=${sessionId}`);
  }


  confirmWalletRecharge(sessionId: string): Observable<WalletResponse> {
    return this.http.get<any>(`${this.apiUrl}/wallet/confirm-wallet?session_id=${sessionId}`);
  }


  loadWalletBooking(bookingId: string): Observable<BookingDetailsResponse> {
    return this.http.get<any>(`${this.apiUrl}/booking/${bookingId}`);
  }
}