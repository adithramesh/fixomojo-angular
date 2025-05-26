import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription, tap } from 'rxjs';
import {
  selectPhoneNumber,
  selectUsername,
} from '../../../store/auth/auth.reducer';
import { HomeService } from '../../../services/home.service';
import { HomeResponseDTO } from '../../../models/home.model';
import { CommonModule } from '@angular/common';
import { DataTableComponent, TableColumn, TableData } from "../../shared/data-table/data-table.component";
import { NavBarComponent } from "../../shared/nav-bar/nav-bar.component";
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, DataTableComponent, NavBarComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
  // User information from store
  username$!: Observable<string | null>;
  userId$!: Observable<string | null>;
  phoneNumber$!: Observable<string | null>;
  
  // Data and status properties
  homeData!: HomeResponseDTO | null;
  isLoading = true;
  error!: string | null;
  
  // Table configuration
  serviceTableColumns: TableColumn[] = [
    { header: 'Types of services', key: 'serviceName', type: 'text', width: '70%' },
    // { header: 'Description', key: 'description', type: 'text', width: '70%' },
    { header: '', key: 'view', type: 'button', buttonText: 'View', buttonClass: 'btn-primary', width: '30%' }
  ];
  
  // Table data
  serviceTableData: TableData[] = [];
  
  // Dependency injection
  private _store = inject(Store);
  private _homeService = inject(HomeService);
  private _subscription: Subscription | undefined;
  private _router = inject(Router)

  constructor() {}

  ngOnInit() {
    // Get user data from store
    this.username$ = this._store.select(selectUsername);
    this.phoneNumber$ = this._store.select(selectPhoneNumber);
    
    // Fetch home data
    this._subscription = this._homeService.getHomeData()
      .pipe(tap(() => (this.isLoading = false)))
      .subscribe({
        next: (data) => {
          console.log("Fetched homeData:", data);
          this.homeData = data;
          
          // Transform service names into table data format
          // Each service name becomes a row in our table
          this.serviceTableData = data.serviceNames?.map(name => ({
            serviceName: name,
            id: name.toLowerCase().replace(/\s+/g, '-') // Create a simple ID based on name
          })) || [];
        },
        error: (error) => {
          console.error('Error:', error);
          this.error = error.message || 'Failed to load home data.';
          this.isLoading = false;
        },
      });
  }
  
  // Handle button clicks from the table
  onServiceAction(event: {action: string, item: TableData}): void {
    if (event.action === 'view') {
      this.viewService(event.item['serviceName']);
    }
  }
  
  // Method to handle service booking
  viewService(serviceName: string): void {
    console.log(`View service: ${serviceName}`);
    this._router.navigate([`/services/${encodeURIComponent(serviceName)}`]);
  }

  ngOnDestroy(): void {
    if (this._subscription) {
      this._subscription.unsubscribe();
    }
  }
}