import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HomeResponseDTO } from "../models/home.model";
import { environment } from "../../environments/environment";
import { PaginatedResponseDTO } from "../models/admin.model";

export interface WalletResponse {
  success: boolean;
  message: string;
  wallet?: {
    balance: number;
    userId: string;
    currency: string;
    // other wallet properties
  };
}

@Injectable({ providedIn: 'root'})
export class WalletService {
    constructor(private http:HttpClient){}
    private apiUrl=`${environment.BACK_END_API_URL}/wallet/`
    getWallet():Observable<WalletResponse>{
        return this.http.get<WalletResponse>(`${this.apiUrl}balance`)
    }

    rechargeWallet(amount:number):Observable<{success:boolean, message:string, checkoutUrl:string}>{
        return this.http.post<{success:boolean, message:string, checkoutUrl:string}>(`${this.apiUrl}recharge`, {amount})
    }
}