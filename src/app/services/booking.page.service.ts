import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { BookServiceResponseDTO } from '../models/book-service.model';

export interface BackendSlotResponse {
  start: string;
  end: string;
  type: 'available' | 'customer-booked' | 'technician-blocked';
  id?: string; // googleEventId
  reason?: string;
}

@Injectable({ providedIn: 'root' })
export class BookingPageService {
  private partnerApiUrl = `${environment.BACK_END_API_URL}/partner`;
  private userApiUrl = `${environment.BACK_END_API_URL}/user`;
  private offerApiUrl = `${environment.BACK_END_API_URL}/offer`;
  constructor(private http: HttpClient) {}


  loadTimeSlotsForTechnicianAndDate(
    technicianId: string,
    date: string
  ): Observable<{ success: boolean; slots: BackendSlotResponse[] }> {
    const params = new HttpParams()
      .set('technicianId', technicianId)
      .set('date', new Date(date).toISOString());

    return this.http.get<{ success: boolean; slots: BackendSlotResponse[] }>(
      `${this.partnerApiUrl}/available-slots`,
      { params }
    );
  }

  applyBestOffer(price:number):Observable<{discountAmount:number, appliedOfferName:string, finalAmount:number}>{
    const params = new HttpParams().set('price', price.toString());
    return this.http.get<{discountAmount:number, appliedOfferName:string, finalAmount:number}>(`${this.offerApiUrl}/check-offer`,{params})
  }


  checkTimeSlotAvailability(
    technicianId: string,
    startTime: string,
    endTime: string
  ): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.userApiUrl}/timeslot/check-availability`,
      { technicianId, startTime, endTime }
    );
  }

  submitData(data:any):Observable<BookServiceResponseDTO>{
    return this.http.post<BookServiceResponseDTO>(`${this.userApiUrl}/book-service`,data)
  }

  blockSlotAfterPayment(blockSlotPayload:any):Observable<{success: boolean, eventId: string, calendarId: string}>{
    return this.http.post<{success: boolean, eventId: string, calendarId: string}>(`${this.partnerApiUrl}/block-slot`,blockSlotPayload)
  }
}
