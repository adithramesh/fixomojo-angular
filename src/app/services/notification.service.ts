// src/app/core/services/notification.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';



export interface PaginationRequestDTO {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: string | "asc" | "desc";
  searchTerm?: string;
  filter?: any; 
}

export interface PaginatedResponseDTO<T> {
  items: T;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  status?: string; 
}


export interface INotification {
  _id: string; 
  recipientId: string;
  recipientRole: string;
  senderId?: string;
  senderRole?: string;
  type: string;
  message: string;
  payload: any; 
  read: boolean; 
  createdAt: string; 
  updatedAt: string; 
  actionTaken?:string
}

interface BackendSuccessResponse<T> {
  success: boolean;
  message: string;
  data: T; 
  status: number; 
}


@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.BACK_END_API_URL}/notification`;

  constructor(private http: HttpClient) { }

 
  getNotifications(pagination: PaginationRequestDTO): Observable<BackendSuccessResponse<PaginatedResponseDTO<INotification[]>>> {
    let params = new HttpParams()
      .set('page', pagination.page.toString())
      .set('pageSize', pagination.pageSize.toString());

    if (pagination.sortBy) {
      params = params.set('sortBy', pagination.sortBy);
    }
    if (pagination.sortOrder) {
      params = params.set('sortOrder', pagination.sortOrder);
    }
    if (pagination.searchTerm) {
      params = params.set('searchTerm', pagination.searchTerm);
    }
  
    if (pagination.filter) {
      params = params.set('filter', JSON.stringify(pagination.filter));
    }

   
    return this.http.get<BackendSuccessResponse<PaginatedResponseDTO<INotification[]>>>(this.apiUrl, { params });
  }


  getUnreadCount(): Observable<BackendSuccessResponse<{ count: number }>> {
    return this.http.get<BackendSuccessResponse<{ count: number }>>(`${this.apiUrl}/unread-count`);
  }


  markAsRead(notificationId: string, actionTaken?:string): Observable<BackendSuccessResponse<any>> {
    return this.http.put<BackendSuccessResponse<any>>(`${this.apiUrl}/${notificationId}/read`, {actionTaken});
  }


  markAllAsRead(): Observable<BackendSuccessResponse<any>> {
    return this.http.put<BackendSuccessResponse<any>>(`${this.apiUrl}/mark-all-read`, {});
  }
}