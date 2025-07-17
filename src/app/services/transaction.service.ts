import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { PaginationRequestDTO } from "../models/admin.model";
import { Transaction } from "../models/wallet.model";


@Injectable({ providedIn: 'root'})
export class TransactionService {
    constructor(private http:HttpClient){}
    private apiUrl=`${environment.BACK_END_API_URL}/transaction/`

    // logTransaction(){
    //     return this.http.get<any>(this.apiUrl)
    // }

    getTransactions(pagination:PaginationRequestDTO){
        let params =this.buildPaginationParams(pagination)
        return this.http.get<{ success: boolean; transaction: Transaction[] }>(`${this.apiUrl}user-transactions`,{params})
    }

    countTransactions(){
      return this.http.get<any>(`${this.apiUrl}count`)
    }

    private buildPaginationParams(pagination: PaginationRequestDTO): HttpParams {
    let params = new HttpParams()
      .set('page', pagination.page.toString())
      .set('pageSize', pagination.pageSize.toString());

    if (pagination.sortBy) {
      params = params.set('sortBy', pagination.sortBy);
      params = params.set('sortOrder', pagination.sortOrder || 'asc');
    }

    if (pagination.searchTerm) {
      params = params.set('searchTerm', pagination.searchTerm);
    }

    return params;
  }
}