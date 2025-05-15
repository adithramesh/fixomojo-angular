import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  UserResponseDTO,
  ServiceResponseDTO, 
  PaginatedResponseDTO,
  PaginationRequestDTO
} from '../models/admin.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:3000/admin/';
  
  constructor(private http: HttpClient) {}
  
  // GET methods with pagination
  getUsers(pagination: PaginationRequestDTO = { page: 1, pageSize: 10 },  role?: 'user' | 'partner'): Observable<PaginatedResponseDTO<UserResponseDTO[]>> {
    let params = this.buildPaginationParams(pagination);
    if (role) {
      params = params.set('role', role); 
    }
    return this.http.get<PaginatedResponseDTO<UserResponseDTO[]>>(`${this.apiUrl}user-management`, { params });
  }
  
  getServices(pagination: PaginationRequestDTO = { page: 1, pageSize: 10 }): Observable<PaginatedResponseDTO<ServiceResponseDTO[]>> {
    let params = this.buildPaginationParams(pagination);
    return this.http.get<PaginatedResponseDTO<ServiceResponseDTO[]>>(`${this.apiUrl}service-management`, { params });
  }

  getAppUsers(pagination: PaginationRequestDTO = { page: 1, pageSize: 10 }): Observable<PaginatedResponseDTO<UserResponseDTO[]>> {
    let params = this.buildPaginationParams(pagination);
    return this.getUsers(pagination,'user')
  }
  
  getPartners(pagination: PaginationRequestDTO = { page: 1, pageSize: 10 }): Observable<PaginatedResponseDTO<UserResponseDTO[]>> {
    let params = this.buildPaginationParams(pagination);
    return this.getUsers(pagination,'partner')
  }

  private buildPaginationParams(pagination: PaginationRequestDTO): HttpParams {
    let params = new HttpParams()
      .set('page', pagination.page.toString())
      .set('pageSize', pagination.pageSize.toString());
      
    if (pagination.sortBy) {
      params = params.set('sortBy', pagination.sortBy);
      params = params.set('sortOrder', pagination.sortOrder || 'asc');
    }
    
    if (pagination.filter) {
      Object.keys(pagination.filter).forEach(key => {
        if (pagination.filter?.[key] !== undefined && pagination.filter?.[key] !== null) {
          params = params.set(key, pagination.filter[key].toString());
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
  
  createService(serviceData: any): Observable<ServiceResponseDTO> {
    return this.http.post<ServiceResponseDTO>(`${this.apiUrl}add-service`, serviceData);
  }

  // updateService(serviceId: string | number, serviceData: any): Observable<ServiceResponseDTO> {
  //   return this.http.put<ServiceResponseDTO>(`${this.apiUrl}services/${serviceId}`, serviceData);
  // }
  
  // deleteService(serviceId: string | number): Observable<void> {
  //   return this.http.delete<void>(`${this.apiUrl}services/${serviceId}`);
  // }
}