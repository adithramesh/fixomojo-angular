import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  UserResponseDTO,
  ServiceResponseDTO, 
  PaginatedResponseDTO,
  PaginationRequestDTO,
  SubServiceResponseDTO,
} from '../models/admin.model';
import { environment } from '../../environments/environment';
import { ServiceLookupDTO } from '../models/offer.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.BACK_END_API_URL}/admin/`;
  
   private http = inject(HttpClient)
  
  // GET methods with pagination
  getUsers(pagination: PaginationRequestDTO,  role?: 'user' | 'partner'): Observable<PaginatedResponseDTO<UserResponseDTO[]>> {
    let params = this.buildPaginationParams(pagination);
    if (role) {
      params = params.set('role', role); 
    }
    return this.http.get<PaginatedResponseDTO<UserResponseDTO[]>>(`${this.apiUrl}user-management`, { params });
  }

  getAppUsers(pagination: PaginationRequestDTO ): Observable<PaginatedResponseDTO<UserResponseDTO[]>> {
    return this.getUsers(pagination,'user')
  }
  
  getPartners(pagination: PaginationRequestDTO ): Observable<PaginatedResponseDTO<UserResponseDTO[]>> {
    return this.getUsers(pagination,'partner')
  }


  getServices(pagination: PaginationRequestDTO): Observable<PaginatedResponseDTO<ServiceResponseDTO[]>> {
    const params = this.buildPaginationParams(pagination);
    return this.http.get<PaginatedResponseDTO<ServiceResponseDTO[]>>(`${this.apiUrl}service-management`, { params });
  }

  getSubServices(pagination: PaginationRequestDTO) {
    const params = this.buildPaginationParams(pagination);
    return this.http.get<PaginatedResponseDTO<SubServiceResponseDTO[]>>(`${this.apiUrl}sub-service-management`, { params });
  }

  getServiceById(serviceId:string):Observable<ServiceResponseDTO>{
    return this.http.get<ServiceResponseDTO>(`${this.apiUrl}service/${serviceId}`)
  }

  getSubServiceById(subServiceId:string):Observable<SubServiceResponseDTO>{
    return this.http.get<SubServiceResponseDTO>(`${this.apiUrl}sub-service/${subServiceId}`)
  }


  private buildPaginationParams(pagination: PaginationRequestDTO): HttpParams {
    let params = new HttpParams()
      .set('page', pagination.page.toString())
      .set('pageSize', pagination.pageSize.toString())
      .set('searchTerm', pagination.searchTerm || '');
    if (pagination.sortBy) {
      params = params.set('sortBy', pagination.sortBy);
      params = params.set('sortOrder', pagination.sortOrder || 'asc');
    }
    // Send each filter key-value pair as separate query parameters

    
    if (pagination.filter && Object.keys(pagination.filter).length > 0) {
      Object.keys(pagination.filter).forEach(key => {
        if (pagination.filter![key] !== undefined && pagination.filter![key] !== null) {
          params = params.set(key, pagination.filter![key].toString());
        }
      });
    }
    return params;
}
  
  // Action methods
  changeUserStatus(userId: string | number | undefined, licenseStatus?:string): Observable<UserResponseDTO> {
    const body = licenseStatus? {licenseStatus}:{};
    return this.http.patch<UserResponseDTO>(`${this.apiUrl}users/${userId}/change-status`, body);
  }

  changeServiceStatus(serviceId: string | number | undefined): Observable<ServiceResponseDTO> {
    return this.http.patch<ServiceResponseDTO>(`${this.apiUrl}services/${serviceId}/change-status`, {});
  }

  changeSubServiceStatus(subServiceId: string | number | undefined): Observable<SubServiceResponseDTO> {
    return this.http.patch<SubServiceResponseDTO>(`${this.apiUrl}sub-services/${subServiceId}/change-status`, {});
  }
  
  createService(formData: FormData): Observable<ServiceResponseDTO> {
    return this.http.post<ServiceResponseDTO>(`${this.apiUrl}add-service`, formData);
  }

  createSubService(serviceId: string, formData: FormData): Observable<SubServiceResponseDTO> {
    return this.http.post<SubServiceResponseDTO>(`${this.apiUrl}services/${serviceId}/sub-services`, formData);
  }

  updateService(serviceId: string | number, formData: FormData): Observable<ServiceResponseDTO> {
    return this.http.put<ServiceResponseDTO>(`${this.apiUrl}services/${serviceId}/update-service`, formData);
  }
  
  updateSubService(subServiceId: string | number, formData: FormData): Observable<SubServiceResponseDTO> {
    return this.http.put<SubServiceResponseDTO>(`${this.apiUrl}sub-services/${subServiceId}/update-sub-service`, formData);
  }

  getActiveServices():Observable<ServiceLookupDTO[]>{
    return this.http.get<ServiceLookupDTO[]>(`${this.apiUrl}active-services`)
  }
  // deleteService(serviceId: string | number): Observable<void> {
  //   return this.http.delete<void>(`${this.apiUrl}services/${serviceId}`);
  // }
}