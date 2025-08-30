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

  getAdminDashboard(): Observable<AdminDashboardResponseDTO> {
    return this.http.get<AdminDashboardResponseDTO>(`${this.apiUrl}/admin/dashboard`);
  }

  getPartnerDashboard(): Observable<PartnerDashboardResponseDTO> {
    return this.http.get<PartnerDashboardResponseDTO>(`${this.apiUrl}/partner/dashboard`);
  }
}