import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { IBooking } from '../models/book-service.model';
import { TableData } from '../components/shared/data-table/data-table.component';


export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
  bookingData?: IBooking; 
}

export interface WalletResponse {
  success: boolean;
  message: string;
}

export interface BookingDetailsResponse {
  success: boolean;
  message: string;
  data?: TableData; 
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = environment.BACK_END_API_URL;

  private http = inject(HttpClient)

  verifyCardPayment(sessionId: string): Observable<VerifyPaymentResponse> {
    return this.http.get<VerifyPaymentResponse>(`${this.apiUrl}/user/verify-payment?session_id=${sessionId}`);
  }


  confirmWalletRecharge(sessionId: string): Observable<WalletResponse> {
    return this.http.get<WalletResponse>(`${this.apiUrl}/wallet/confirm-wallet?session_id=${sessionId}`);
  }


  loadWalletBooking(bookingId: string): Observable<BookingDetailsResponse> {
    return this.http.get<BookingDetailsResponse>(`${this.apiUrl}/booking/${bookingId}`);
  }
}