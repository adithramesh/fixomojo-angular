import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { log } from 'node:console';
import { AdminDashboardResponseDTO, PartnerDashboardResponseDTO } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.BACK_END_API_URL}`;
  
  constructor(private http: HttpClient) {}

  getAdminDashboard(startDate?: string, endDate?: string): Observable<AdminDashboardResponseDTO> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<AdminDashboardResponseDTO>(`${this.apiUrl}/admin/dashboard`, {params});
  }

  getPartnerDashboard(): Observable<PartnerDashboardResponseDTO> {
    return this.http.get<PartnerDashboardResponseDTO>(`${this.apiUrl}/partner/dashboard`);
  }
}