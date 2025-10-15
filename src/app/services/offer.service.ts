import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { OfferApiResponse, OfferDataDTO } from '../models/offer.model';
import { PaginatedResponseDTO } from '../models/admin.model';
import { environment } from '../../environments/environment.prod';




@Injectable({
  providedIn: 'root',
})
export class OfferService {

  
  private apiUrl = `${environment.BACK_END_API_URL}/offer`; 

  private http = inject(HttpClient)



  addOffer(offer: OfferDataDTO): Observable<OfferDataDTO> {
    return this.http.post<OfferDataDTO>(`${this.apiUrl}/add`, offer);
  }

  getAllOffers(page: number, pageSize: number, sortBy: string, sortOrder: string, filter = {}): Observable<PaginatedResponseDTO<OfferDataDTO[]>> {
    const params = { page, pageSize, sortBy, sortOrder, ...filter };
    return this.http.get<OfferApiResponse>(`${this.apiUrl}/all`, { params }).pipe(
      map(response=>{
        return {
        items: response.data.offers,   // map backend `data.offers` → `items`
        success: response.success,
        total: response.data.pagination.total,
        page: response.data.pagination.page,
        pageSize: response.data.pagination.limit,
        totalPages: response.data.pagination.pages,
        } as PaginatedResponseDTO<OfferDataDTO[]>;
      })
    );
  }

  getOfferById(id: string): Observable<{success:boolean, data:OfferDataDTO}> {
    return this.http.get<{success:boolean, data:OfferDataDTO}>(`${this.apiUrl}/update/${id}`);
  }

  updateOffer(id: string, offer: OfferDataDTO): Observable<OfferDataDTO> {
    return this.http.put<OfferDataDTO>(`${this.apiUrl}/update/${id}`, offer);
  }

  deleteOffer(id:string):Observable<{success:boolean, message:string}> {
    return this.http.delete<{success:boolean, message:string}>(`${this.apiUrl}/delete-offer/${id}`)
  }

  // toggleOfferStatus(id: string): Observable<{success:boolean, message:string, data:OfferDataDTO}> {
  //   return this.http.put<{success:boolean, message:string, data:OfferDataDTO}>(`${this.apiUrl}/toggle-status/${id}`, {});
  // }

  toggleOfferStatus(id: string): Observable<OfferDataDTO> {
    return this.http.put<OfferDataDTO>(`${this.apiUrl}/toggle-status/${id}`, {});
  }


}

