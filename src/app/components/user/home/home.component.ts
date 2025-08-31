import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  selectPhoneNumber,
  selectUsername,
} from '../../../store/auth/auth.reducer';
import { AdminService } from '../../../services/admin.service'; 
import { PaginatedResponseDTO, ServiceResponseDTO } from '../../../models/admin.model'; 
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
 
  username$!: Observable<string | null>;
  phoneNumber$!: Observable<string | null>;

  featuredServices: ServiceResponseDTO[] = []; 
  isLoading = true;
  error: string | null = null;

  private _store = inject(Store);
  private _adminService = inject(AdminService); 
  private _subscription: Subscription = new Subscription();
  private _router = inject(Router)
  public _imageUrlService = inject(ImageUrlService)

  constructor() {}

  ngOnInit() {
 
    this.username$ = this._store.select(selectUsername);
    this.phoneNumber$ = this._store.select(selectPhoneNumber);
    

    this.loadFeaturedServices();
  }
  
 
  loadFeaturedServices() {
  
    const pagination = {
      page: 1,
      pageSize: 6, 
      sortBy: 'serviceName',
      sortOrder: 'asc' as const,
      searchTerm: '',
    };

    this._subscription.add(
      this._adminService.getServices(pagination)
        .pipe(tap(() => (this.isLoading = false)))
        .subscribe({
          next: (response: PaginatedResponseDTO<ServiceResponseDTO[]>) => {
            this.featuredServices = response.items.filter(service => service.status === 'active');; 
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



  viewAllServices(): void {
    this._router.navigate(['/services']);
  }

 
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