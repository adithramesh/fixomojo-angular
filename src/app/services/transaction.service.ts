


import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { PaginationRequestDTO } from "../models/admin.model";
import { Transaction } from "../models/wallet.model";

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.BACK_END_API_URL}/transaction/`;

  getTransactions(pagination: PaginationRequestDTO) {
    const params = this.buildPaginationParams(pagination);
    return this.http.get<{ success: boolean; transaction: Transaction[] }>(
      `${this.apiUrl}user-transactions`,
      { params }
    );
  }

  countTransactions(filter: Record<string, string | number | boolean | undefined> = {}) {
    let params = new HttpParams();
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return this.http.get<{ success: boolean, count: number ,message:string}>(
      `${this.apiUrl}count`,
      { params }
    );
  }

  private buildPaginationParams(pagination: PaginationRequestDTO): HttpParams {
    let params = new HttpParams()
      .set('page', pagination.page.toString())
      .set('pageSize', pagination.pageSize.toString());

    if (pagination.sortBy) {
      params = params
        .set('sortBy', pagination.sortBy)
        .set('sortOrder', pagination.sortOrder ?? 'asc');
    }

    if (pagination.searchTerm) {
      params = params.set('searchTerm', pagination.searchTerm);
    }

    if (pagination.filter) {
      Object.entries(pagination.filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, String(value));
        }
      });
    }

    return params;
  }
}
