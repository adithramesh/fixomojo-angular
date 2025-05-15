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
    { header: 'Service Name', key: 'serviceName', type: 'text', width: '70%' },
    // { header: 'Description', key: 'description', type: 'text', width: '70%' },
    { header: 'Book', key: 'book', type: 'button', buttonText: 'Book Now', buttonClass: 'btn-primary', width: '30%' }
  ];
  
  // Table data
  serviceTableData: TableData[] = [];
  
  // Dependency injection
  private _store = inject(Store);
  private _homeService = inject(HomeService);
  private _subscription: Subscription | undefined;

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
    if (event.action === 'book') {
      this.bookService(event.item['serviceName']);
    }
  }
  
  // Method to handle service booking
  bookService(serviceName: string): void {
    console.log(`Booking service: ${serviceName}`);
    // Here you would typically navigate to a booking page or open a modal
    // For example: this.router.navigate(['/booking'], { queryParams: { service: serviceName } });
  }

  ngOnDestroy(): void {
    if (this._subscription) {
      this._subscription.unsubscribe();
    }
  }
}