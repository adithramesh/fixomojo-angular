import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  UserResponseDTO,
  ServiceResponseDTO, 
  PaginatedResponseDTO,
  PaginationRequestDTO,
  SubServiceRequestDTO,
  SubServiceResponseDTO,
  ServiceRequestDTO
} from '../models/admin.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:3000/admin/';
  
  constructor(private http: HttpClient) {}
  
  // GET methods with pagination
  getUsers(pagination: PaginationRequestDTO,  role?: 'user' | 'partner'): Observable<PaginatedResponseDTO<UserResponseDTO[]>> {
    let params = this.buildPaginationParams(pagination);
    if (role) {
      params = params.set('role', role); 
    }
    return this.http.get<PaginatedResponseDTO<UserResponseDTO[]>>(`${this.apiUrl}user-management`, { params });
  }

  getAppUsers(pagination: PaginationRequestDTO ): Observable<PaginatedResponseDTO<UserResponseDTO[]>> {
    let params = this.buildPaginationParams(pagination);
    return this.getUsers(pagination,'user')
  }
  
  getPartners(pagination: PaginationRequestDTO ): Observable<PaginatedResponseDTO<UserResponseDTO[]>> {
    let params = this.buildPaginationParams(pagination);
    return this.getUsers(pagination,'partner')
  }

  getServices(pagination: PaginationRequestDTO = { page: 1, pageSize:10 , sortBy: 'serviceName', sortOrder: 'asc', searchTerm: '' }): Observable<PaginatedResponseDTO<ServiceResponseDTO[]>> {
    let params = this.buildPaginationParams(pagination);
    return this.http.get<PaginatedResponseDTO<ServiceResponseDTO[]>>(`${this.apiUrl}service-management`, { params });
  }

  getSubServices(pagination: PaginationRequestDTO) {
    let params = this.buildPaginationParams(pagination);
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
     params = params.set('searchTerm', pagination.searchTerm || '') 

    if (pagination.sortBy) {
      params = params.set('sortBy', pagination.sortBy);
      params = params.set('sortOrder', pagination.sortOrder || 'asc');
    }
    
    // if (pagination.filter) {
    //   Object.keys(pagination.filter).forEach(key => {
    //     if (pagination.filter?.[key] !== undefined && pagination.filter?.[key] !== null) {
    //       params = params.set(key, pagination.filter[key].toString());
    //     }
    //   });
    // }
    if (pagination.filter && Object.keys(pagination.filter).length > 0) {
    // Stringify the entire filter object to send it as one query parameter
    console.log("JSON.stringify(pagination.filter)",pagination.filter);
    
    params = params.set('filter', pagination.filter) ;
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
  
  createService(serviceData: any): Observable<ServiceResponseDTO> {
    return this.http.post<ServiceResponseDTO>(`${this.apiUrl}add-service`, serviceData);
  }

  createSubService(serviceId: string, subServiceData: SubServiceRequestDTO): Observable<SubServiceResponseDTO> {
    return this.http.post<SubServiceResponseDTO>(`${this.apiUrl}services/${serviceId}/sub-services`, subServiceData);
  }

  updateService(serviceId: string | number, serviceData: ServiceRequestDTO): Observable<ServiceResponseDTO> {
    return this.http.put<ServiceResponseDTO>(`${this.apiUrl}services/${serviceId}/update-service`, serviceData);
  }
  
  updateSubService(subServiceId: string | number, subServiceData: SubServiceRequestDTO): Observable<SubServiceResponseDTO> {
    return this.http.put<SubServiceResponseDTO>(`${this.apiUrl}sub-services/${subServiceId}/update-sub-service`, subServiceData);
  }
  // deleteService(serviceId: string | number): Observable<void> {
  //   return this.http.delete<void>(`${this.apiUrl}services/${serviceId}`);
  // }
}