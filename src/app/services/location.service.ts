import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { UserResponseDTO } from '../models/admin.model';
import { environment } from '../../environments/environment';
import { AutocompleteSuggestion } from '../models/location.model';


@Injectable({
  providedIn: 'root'
})
export class LocationService {

  private http = inject(HttpClient)
  private locationIqApiKey = environment.LOCATION_IQ_API_KEY;
  private apiUrl=`${environment.BACK_END_API_URL}/admin/`

  getBrowserCurrentLocation(): Observable<{ latitude: number, longitude: number }> {
    return new Observable((observer: Observer<{ latitude: number, longitude: number }>) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position: GeolocationPosition) => {
            observer.next({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
            observer.complete();
          },
          (error: GeolocationPositionError) => {
            observer.error(error);
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 } // Options for better accuracy
        );
      } else {
        observer.error('Geolocation is not supported by this browser.');
      }
    });
  }

  getLocationIqAutocomplete(query: string): Observable<AutocompleteSuggestion[]> {
     const baseUrl = environment.production
    ? 'https://api.locationiq.com'
    : '/locationiq';
    const url = `${baseUrl}/locationiq/v1/autocomplete?key=${this.locationIqApiKey}&q=${query}&limit=5&format=json`;
    return this.http.get<AutocompleteSuggestion[]>(url);
  }

  getLocationDetailsByLatLng(lat: string, lon: string): Observable<object> {
     const baseUrl = environment.production
    ? 'https://api.locationiq.com'
    : '/locationiq';
    const url = `${baseUrl}/locationiq/v1/reverse?key=${this.locationIqApiKey}&lat=${lat}&lon=${lon}&format=json`;
    return this.http.get<object>(url);
  }

  updateTechnicianWithLocation(userId:string|undefined,location:{ address?: string; latitude?: number; longitude?: number }){
    return this.http.patch<UserResponseDTO>(`${this.apiUrl}partner/${userId}/location`,location)
  }

  getSavedLocation(){
    return this.http.get<string>(`${this.apiUrl}saved-location`)
  }

}