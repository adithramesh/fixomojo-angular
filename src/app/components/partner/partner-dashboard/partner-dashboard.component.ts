import { Component, inject } from '@angular/core';
import {  DataTableComponent } from '../../shared/data-table/data-table.component';
import { NavBarComponent } from "../../shared/nav-bar/nav-bar.component";
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { selectPhoneNumber, selectUsername } from '../../../store/auth/auth.reducer';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-partner-dashboard',
  imports: [NavBarComponent, CommonModule],
  templateUrl: './partner-dashboard.component.html',
  styleUrl: './partner-dashboard.component.scss'
})
export class PartnerDashboardComponent {
  private _store = inject(Store)
  phoneNumber$!:Observable<string|null>
  username$!:Observable<string|null>

  ngOnInit(){
  this.username$=this._store.select(selectUsername)
  this.phoneNumber$=this._store.select(selectPhoneNumber)||''
  }
}
