import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HomeResponseDTO } from "../models/home.model";
import { environment } from "../../environments/environment";
import { PaginatedResponseDTO } from "../models/admin.model";

@Injectable({ providedIn: 'root'})
export class HomeService {
    private http = inject(HttpClient)
    private apiUrl=`${environment.BACK_END_API_URL}/user/`
    getHomeData(searchTerm:string):Observable<PaginatedResponseDTO<HomeResponseDTO>>{
        const params = new HttpParams().set('searchTerm', searchTerm || '');
        return this.http.get<PaginatedResponseDTO<HomeResponseDTO>>(`${this.apiUrl}home`,{params})
    }
}