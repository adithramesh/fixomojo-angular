import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  UserResponseDTO, 
  PaginatedResponseDTO
} from '../models/admin.model';
import { BookingRequestDTO, BookingResponseDTO } from '../models/booking.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:3000/booking/';
  constructor(private http: HttpClient) {}

  getCurrentLocation(){}

  getTechniciansByService(serviceId:string):Observable<UserResponseDTO>{
    return this.http.get<UserResponseDTO>(`${this.apiUrl}${serviceId}/technicians`)
  }

  // getTimeSlotForTechnician(technicianId:string):Observable<any>{
  //   return this.http.get(`http://localhost:3000/partner/available-slots`)
  // }
  
  createBooking(userId:string, bookingData:BookingRequestDTO):Observable<BookingResponseDTO>{
    return this.http.post<BookingResponseDTO>(`${this.apiUrl}create-booking/${userId}`,bookingData)
  }
    
}