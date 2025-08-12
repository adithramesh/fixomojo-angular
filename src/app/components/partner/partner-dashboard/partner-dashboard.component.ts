import { Component, inject } from '@angular/core';
import {  DataTableComponent } from '../../shared/data-table/data-table.component';
import { NavBarComponent } from "../../shared/nav-bar/nav-bar.component";
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectPhoneNumber, selectUsername } from '../../../store/auth/auth.reducer';
import { CommonModule } from '@angular/common';
import { PartnerSideBarComponent } from "../partner-side-bar/partner-side-bar.component";
import { LocationService } from '../../../services/location.service';

@Component({
  selector: 'app-partner-dashboard',
  imports: [ CommonModule, PartnerSideBarComponent],
  templateUrl: './partner-dashboard.component.html',
  styleUrl: './partner-dashboard.component.scss'
})
export class PartnerDashboardComponent {
  private _store = inject(Store)
  private _locationService = inject(LocationService)
  phoneNumber$!:Observable<string|null>
  username$!:Observable<string|null>
  savedLocation!:string

  ngOnInit(){
  this.username$=this._store.select(selectUsername)
  this.phoneNumber$=this._store.select(selectPhoneNumber)||''
  this._locationService.getSavedLocation().subscribe(location=>{
    console.log("location", location);
    
    if(location){
      this.savedLocation=location
    }
  })
  }
}
