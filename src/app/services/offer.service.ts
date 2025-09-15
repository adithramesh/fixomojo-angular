import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { OfferDataRequestDTO } from '../models/offer.model';

@Injectable({
  providedIn: 'root',
})
export class OfferService {
  private apiUrl = `${environment.BACK_END_API_URL}/offer`; 

  constructor(private http: HttpClient) {}

  addOffer(offer: OfferDataRequestDTO): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/add`, offer);
  }

  getAllOffers(page: number, pageSize: number, sortBy: string, sortOrder: string, filter: any = {}): Observable<any> {
    const params = { page, pageSize, sortBy, sortOrder, ...filter };
    return this.http.get<any>(`${this.apiUrl}/all`, { params });
  }

  getOfferById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/update/${id}`);
  }

  updateOffer(id: string, offer: OfferDataRequestDTO): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/update/${id}`, offer);
  }

  deleteOffer(id:string):Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/delete-offer/${id}`)
  }

  toggleOfferStatus(id: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/toggle-status/${id}`, {});
  }
}

