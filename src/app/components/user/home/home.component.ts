// import { Component, inject, OnInit, OnDestroy } from '@angular/core';
// import { Store } from '@ngrx/store';
// // import { debounceTime, distinctUntilChanged, Observable, Subject, Subscription, tap } from 'rxjs';
// import { Subscription, Observable, Subject } from 'rxjs';
// import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
// import {
//   selectPhoneNumber,
//   selectUsername,
// } from '../../../store/auth/auth.reducer';
// import { HomeService } from '../../../services/home.service';
// import { HomeResponseDTO } from '../../../models/home.model';
// import { CommonModule } from '@angular/common';
// import { DataTableComponent, TableColumn, TableData } from "../../shared/data-table/data-table.component";
// import { NavBarComponent } from "../../shared/nav-bar/nav-bar.component";
// import { Router } from '@angular/router';
// import { ServiceCardComponent } from '../../shared/service-card/service-card.component';
// import { PaginationRequestDTO } from '../../../models/admin.model';

// @Component({
//   selector: 'app-home',
//   standalone: true,
//   imports: [CommonModule, DataTableComponent, NavBarComponent, ServiceCardComponent],
//   templateUrl: './home.component.html',
//   styleUrl: './home.component.scss',
// })
// export class HomeComponent implements OnInit, OnDestroy {
//   // User information from store
//   username$!: Observable<string | null>;
//   userId$!: Observable<string | null>;
//   phoneNumber$!: Observable<string | null>;
  
//   // Data and status properties
//   homeData!: HomeResponseDTO | null;
//   isLoading = true;
//   error!: string | null;


  
//   // Table configuration
//   serviceTableColumns: TableColumn[] = [
//     { header: 'Types of services', key: 'serviceName', type: 'text', width: '70%' },
//     // { header: 'Description', key: 'description', type: 'text', width: '70%' },
//     { header: '', key: 'view', type: 'button', buttonText: 'View', buttonClass: 'btn-primary', width: '30%' }
//   ];
  
//   viewMode: 'table' | 'card' = 'card';
//   // Table data
//   serviceTableData: TableData[] = [];
//     //card
//   services: any[] = []

//   // Dependency injection
//   private _store = inject(Store);
//   private _homeService = inject(HomeService);
//   // private _subscription: Subscription | undefined;
//   private _subscription: Subscription = new Subscription();
//   private _router = inject(Router)
//   private searchSubject = new Subject<string>();
//   searchTerm:string = '';
//   //pagiation
//     pagination: PaginationRequestDTO = {
//       page: 1,
//       pageSize: 6,
//       sortBy: 'serviceName',
//       sortOrder: 'asc',
//       searchTerm:''
//     };
//     totalPages = 0;
//   constructor() {}

//   ngOnInit() {
//     // Get user data from store
//     this.username$ = this._store.select(selectUsername);
//     this.phoneNumber$ = this._store.select(selectPhoneNumber);

//     //search-term
//        this._subscription.add(this.searchSubject.pipe(
//           debounceTime(300),
//           distinctUntilChanged()
//         ).subscribe(searchTerm=>{
//           this.searchTerm=searchTerm;
//           console.log("searchTerm",searchTerm);
//           this.pagination.searchTerm = searchTerm; 
//           this.pagination.page = 1;
          
//           this.getHomeData();
//         }))
      
//         this.getHomeData()
//   }
  
//   getHomeData(){
//         // Fetch home data
//     this._subscription = this._homeService.getHomeData(this.pagination.searchTerm as string)
//       .pipe(tap(() => (this.isLoading = false)))
//       .subscribe({
//         next: (data) => {
//         this.totalPages=data.totalPages
//         if (Array.isArray(data.services)) {
//           this.serviceTableData = data.services.map(service => ({
            
//             serviceName: service.serviceName,
//             serviceId: service.serviceId
//           }));
//           this.services = data.services; // ✅ For cards
//         } else {
//           this.serviceTableData = [];
//           this.services = [];
//         }
//         },
//         error: (error) => {
//           console.error('Error:', error);
//           this.error = error.message || 'Failed to load home data.';
//           this.isLoading = false;
//         },
//       });
//   }

//   onSearchChange(searchTerm: string): void {
//     this.searchSubject.next(searchTerm);
//   }
//   // Handle button clicks from the table
//   onServiceAction(event: {action: string, item: TableData}): void {
//     if (event.action === 'view') {
//       this.viewService(event.item as { serviceId: string; serviceName: string });
//     }
//   }

//   onPageChange(newPage: number): void {
//     this.pagination.page = newPage;
//     this.getHomeData();
//   }
  
  
//   viewService(service: { serviceId: string, serviceName: string }): void {
//      this._router.navigate(['/services'], {
//       queryParams: {
//       serviceId: service.serviceId,
//       serviceName: service.serviceName
//     }
//   });
//   }

//   ngOnDestroy(): void {
//     if (this._subscription) {
//       this._subscription.unsubscribe();
//     }
//   }
// }

import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  selectPhoneNumber,
  selectUsername,
} from '../../../store/auth/auth.reducer';
import { AdminService } from '../../../services/admin.service'; // Changed from HomeService
import { PaginatedResponseDTO, ServiceResponseDTO } from '../../../models/admin.model'; // Updated imports
import { CommonModule } from '@angular/common';
import { NavBarComponent } from "../../shared/nav-bar/nav-bar.component";
import { Router } from '@angular/router';
import { ServiceCardComponent } from '../../shared/service-card/service-card.component';
import { ImageUrlService } from '../../../services/image.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NavBarComponent, ServiceCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
  // User information from store
  username$!: Observable<string | null>;
  phoneNumber$!: Observable<string | null>;
  
  // Data and status properties
  featuredServices: ServiceResponseDTO[] = []; // Only featured services for home
  isLoading = true;
  error: string | null = null;

  // Dependency injection
  private _store = inject(Store);
  private _adminService = inject(AdminService); // Changed from HomeService
  private _subscription: Subscription = new Subscription();
  private _router = inject(Router)
  public _imageUrlService = inject(ImageUrlService)

  constructor() {}

  ngOnInit() {
    // Get user data from store
    this.username$ = this._store.select(selectUsername);
    this.phoneNumber$ = this._store.select(selectPhoneNumber);
    
    // Load featured services for home page
    this.loadFeaturedServices();
  }
  
  /**
   * Loads only the first 6 services to display as "featured" on home page
   * This keeps the home page simple and fast-loading
   */
  loadFeaturedServices() {
    // Call existing getServices API but limit to first 6 items
    const pagination = {
      page: 1,
      pageSize: 6, // Only show 6 featured services
      sortBy: 'serviceName',
      sortOrder: 'asc' as const,
      searchTerm: '',
    };

    this._subscription.add(
      this._adminService.getServices(pagination)
        .pipe(tap(() => (this.isLoading = false)))
        .subscribe({
          next: (response: PaginatedResponseDTO<ServiceResponseDTO[]>) => {
            this.featuredServices = response.items.filter(service => service.status === 'active');; // Get services from paginated response
            console.log("featured service", this.featuredServices); 
            this.error = null;
          },
          error: (error) => {
            console.error('Error loading featured services:', error);
            this.error = 'Failed to load services. Please try again.';
            this.isLoading = false;
          },
        })
    );
  }



  /**
   * Navigate to full services page where user can search, paginate, etc.
   */
  viewAllServices(): void {
    this._router.navigate(['/services']);
  }

  /**
   * Navigate to specific service details
   */
  viewService(service: ServiceResponseDTO): void {
    this._router.navigate(['/services'], {
      queryParams: {
        serviceId: service.id,
        serviceName: service.serviceName
      }
    });
  }

  ngOnDestroy(): void {
    if (this._subscription) {
      this._subscription.unsubscribe();
    }
  }
}