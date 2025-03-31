import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AdminSignupData, PartnerSignUpData, User, UserSignUpData } from '../models/auth.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http:HttpClient) { }

  api='http://localhost:3000/'
  signUp(data:UserSignUpData | PartnerSignUpData | AdminSignupData):Observable<User>{
    return this.http.post<User>(`${this.api}signup`,data)
  }
}
