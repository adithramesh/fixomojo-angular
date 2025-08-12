// src/app/core/services/notification.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


// Re-using your DTOs/Interfaces from the backend (or creating local interfaces that match)
export interface PaginationRequestDTO {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: string | "asc" | "desc";
  searchTerm?: string;
  filter?: any; // Or specific Record<string, unknown> if your filters are structured
}

export interface PaginatedResponseDTO<T> {
  items: T;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  status?: string; // Add this if your backend response includes a status field directly in the paginated data
}

// Interface for a single Notification item (matches backend INotification)
export interface INotification {
  _id: string; // MongoDB ObjectId as string
  recipientId: string;
  recipientRole: string;
  senderId?: string;
  senderRole?: string;
  type: string;
  message: string;
  payload: any; // e.g., { bookingId: string } - Use 'any' or define specific types for common payloads
  read: boolean; // Renamed from 'isRead' to 'read' to match backend
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

// Backend API success response structure
interface BackendSuccessResponse<T> {
  success: boolean;
  message: string;
  data: T; // The actual data payload, which could be PaginatedResponseDTO, a count object, etc.
  status: number; // HTTP status code from backend's custom response
}


@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.BACK_END_API_URL}/notification`;

  constructor(private http: HttpClient) { }

  /**
   * Fetches paginated notifications for the current user from the backend.
   * @param pagination The pagination request DTO.
   * @returns An Observable of the backend's success response containing PaginatedResponseDTO<INotification[]>.
   */
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
    // Convert filter object to JSON string for the backend
    if (pagination.filter) {
      params = params.set('filter', JSON.stringify(pagination.filter));
    }

    // The backend's response includes a 'data' field containing the PaginatedResponseDTO
    return this.http.get<BackendSuccessResponse<PaginatedResponseDTO<INotification[]>>>(this.apiUrl, { params });
  }


  getUnreadCount(): Observable<BackendSuccessResponse<{ count: number }>> {
    return this.http.get<BackendSuccessResponse<{ count: number }>>(`${this.apiUrl}/unread-count`);
  }


  markAsRead(notificationId: string): Observable<BackendSuccessResponse<any>> {
    return this.http.put<BackendSuccessResponse<any>>(`${this.apiUrl}/${notificationId}/read`, {});
  }


  markAllAsRead(): Observable<BackendSuccessResponse<any>> {
    return this.http.put<BackendSuccessResponse<any>>(`${this.apiUrl}/mark-all-read`, {});
  }
}