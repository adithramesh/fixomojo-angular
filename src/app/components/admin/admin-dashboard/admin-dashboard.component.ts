import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { DataTableComponent, TableColumn, TableData } from "../../shared/data-table/data-table.component";
import { Store } from '@ngrx/store';
import { AdminService } from '../../../services/admin.service';
import { Observable, Subscription } from 'rxjs';
import { selectPhoneNumber, selectUsername } from '../../../store/auth/auth.reducer';
import { PaginationRequestDTO, UserResponseDTO } from '../../../models/admin.model';
import { SidebarComponent } from "../side-bar/side-bar.component";
import { CommonModule } from '@angular/common';
import { NavBarComponent } from "../../shared/nav-bar/nav-bar.component";

@Component({
  selector: 'app-admin-dashboard',
  standalone: true, 
  imports: [SidebarComponent, CommonModule, NavBarComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent  {
  private _store = inject(Store);
  private _adminService = inject(AdminService);
  subscription: Subscription | undefined;

  username$!: Observable<string | null>;
  phoneNumber$!: Observable<string | null>;

  ngOnInit() {
    this.username$ = this._store.select(selectUsername);
    this.phoneNumber$ = this._store.select(selectPhoneNumber); 
  
  }
  
  
}