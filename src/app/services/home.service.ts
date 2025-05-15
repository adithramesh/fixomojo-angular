import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HomeResponseDTO } from "../models/home.model";

@Injectable({ providedIn: 'root'})
export class HomeService {
    constructor(private http:HttpClient){}
    private apiUrl='http://localhost:3000/user/'
    getHomeData():Observable<HomeResponseDTO>{
        return this.http.get<HomeResponseDTO>(`${this.apiUrl}home`)
    }
}