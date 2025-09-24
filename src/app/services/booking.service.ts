import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable} from 'rxjs';
import { PaginatedResponseDTO, PaginationRequestDTO } from '../models/admin.model';
import { environment } from '../../environments/environment';
import { IBooking } from '../models/book-service.model';
import { TableData } from '../components/shared/data-table/data-table.component';


// Define the expected backend response structure
type PaginatedBookingResponse = PaginatedResponseDTO<IBooking[]>;
export interface BookingResponse {
  success: boolean;
  message: string;
  bookingList?: PaginatedBookingResponse; 
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl =`${environment.BACK_END_API_URL}/booking`
  private bookingData! : IBooking | null
  private bookingUpdatedSubject = new BehaviorSubject<TableData | null>(null)
  bookingUpdated$ = this.bookingUpdatedSubject.asObservable()
  private http = inject(HttpClient)

  getBookings(pagination: PaginationRequestDTO): Observable<BookingResponse> {
    const params = this.buildPaginationParams(pagination);
    return this.http.get<BookingResponse>(this.apiUrl, { params });
  }

  getAllBookingsForAdmin(pagination: PaginationRequestDTO): Observable<BookingResponse> {
    const params = this.buildPaginationParams(pagination);
    return this.http.get<BookingResponse>(`${this.apiUrl}/all`, { params });
  }

  countBookings():Observable<number>{
    return this.http.get<number>(`${this.apiUrl}/count`)
  }

  initiateWorkComplete(bookingId:string):Observable<{success:boolean, message:string}>{
    const params = new HttpParams().set('bookingId', bookingId)
    return this.http.get<{success:boolean, message:string}>(`${this.apiUrl}/initiate-complete`, { params });
  }

  verifyWorkComplete(otp:string, bookingId:string):Observable<{success:boolean, message:string}>{
    return this.http.post<{success:boolean, message:string}>(`${this.apiUrl}/verify-work`, {otp, bookingId});
  }

  cancelBooking(bookingId:string):Observable<{success:boolean, message:string}>{
    return this.http.post<{success:boolean, message:string}>(`${this.apiUrl}/cancel/${bookingId}`, {});
  }

  emitBookingUpdate(updatedBooking: TableData){
    this.bookingUpdatedSubject.next(updatedBooking)
  }

  setBookingData(data: IBooking) {
    this.bookingData = data;
  }

  getBookingData() {
    return this.bookingData;
  }

  clear() {
    this.bookingData = null;
  }

  private buildPaginationParams(pagination: PaginationRequestDTO): HttpParams {
    let params = new HttpParams()
      .set('page', pagination.page.toString())
      .set('pageSize', pagination.pageSize.toString());

    if (pagination.sortBy) {
      params = params.set('sortBy', pagination.sortBy);
      params = params.set('sortOrder', pagination.sortOrder || 'asc');
    }

    if (pagination.searchTerm) {
      params = params.set('searchTerm', pagination.searchTerm);
    }

    return params;
  }
}