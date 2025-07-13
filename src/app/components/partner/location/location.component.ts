import { Component, inject } from '@angular/core';
import { LocationService } from '../../../services/location.service';
import { CommonModule } from '@angular/common';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil, Subject, Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { selectTempUserId } from '../../../store/auth/auth.reducer';
import { NavBarComponent } from "../../shared/nav-bar/nav-bar.component";
import { PartnerSideBarComponent } from "../partner-side-bar/partner-side-bar.component";
import { Router } from '@angular/router';

@Component({
  selector: 'app-location',
  imports: [CommonModule, FormsModule, NavBarComponent, PartnerSideBarComponent],
  templateUrl: './location.component.html',
  styleUrl: './location.component.scss'
})
export class LocationComponent {
  currentLatitude?: number;
  currentLongitude?: number;
  errorMessage?: string;

  // Typed location fields
  addressInput: string = '';
  autocompleteSuggestions: any[] = [];
  selectedAddressDetails?: { address: string; latitude: number; longitude: number };
  typedLocationErrorMessage?: string;

  showAddressInputField: boolean = false;

  private _locationService = inject(LocationService);
  private _destroy$ = new Subject<void>();
  private addressInputChanges = new Subject<string>();
  private _store = inject(Store)
  private _userId!:Observable<string|null>
  private _router = inject(Router)


  ngOnInit(): void {

    this._userId=this._store.select(selectTempUserId)
    this.addressInputChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => this._locationService.getLocationIqAutocomplete(query)),
      takeUntil(this._destroy$)
    ).subscribe({
      next: (suggestions) => {
        this.autocompleteSuggestions = suggestions;
        this.typedLocationErrorMessage = undefined;
      },
      error: (err) => {
        this.typedLocationErrorMessage = `Error fetching suggestions: ${err.message || 'Unknown error'}`;
        this.autocompleteSuggestions = [];
        console.error(err);
      }
    });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  onAddressInputChange(value: string): void {
    this.addressInputChanges.next(value);
    this.selectedAddressDetails = undefined;
    this.autocompleteSuggestions = [];
  }

  onSelectSuggestion(suggestion: any): void {
    this.addressInput = suggestion.display_name;
    this.selectedAddressDetails = {
      address: suggestion.display_name,
      latitude: parseFloat(suggestion.lat),
      longitude: parseFloat(suggestion.lon)
    };
    this.autocompleteSuggestions = [];
  }

  getMyCurrentLocation(): void {
    this.errorMessage = undefined;
    this._locationService.getBrowserCurrentLocation().subscribe({
      next: (coords) => {
        this.currentLatitude = coords.latitude;
        this.currentLongitude = coords.longitude;
        console.log("Latitude, Longitude:", this.currentLatitude, this.currentLongitude);
      },
      error: (err) => {
        this.errorMessage = `Error getting location: ${err.message || err}`;
        console.error(err);
      }
    });
  }

  chooseDifferentLocation(): void {
    this.showAddressInputField = true;
    this.addressInput = '';
    this.autocompleteSuggestions = [];
    this.selectedAddressDetails = undefined;
    this.typedLocationErrorMessage = undefined;
  }

  updateLatLon(){
    console.log("inside lat lon");
     console.trace("TRACE: updateLatLon called");
    this._userId.subscribe((id)=>{
      console.log("User ID received:", id);
      if(!id ) return
      let locationToSend;
      if(this.selectedAddressDetails){
        locationToSend={
          address: this.selectedAddressDetails.address,
          latitude: this.selectedAddressDetails.latitude,
          longitude: this.selectedAddressDetails.longitude
        }
      }else if(this.currentLatitude && this.currentLongitude){
        locationToSend = {
        address: 'Current Location',
        latitude: this.currentLatitude,
        longitude: this.currentLongitude
      };
      }else {
      this.errorMessage = "Please select or allow a location.";
      return;
    }

    this._locationService.updateTechnicianWithLocation(id,locationToSend).subscribe({
      next:(res)=>{
        console.log("Technician location saved", res);
        this._router.navigate(['/partner-dashboard'])
      },
      error:(err)=>{
         this.errorMessage = 'Failed to update location';
          console.error(err);
      }
    })
    })

  }
}
