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
import { FooterComponent } from '../../shared/footer/footer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NavBarComponent, ServiceCardComponent, FooterComponent],
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