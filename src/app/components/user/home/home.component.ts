

import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription, Observable, interval } from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  selectPhoneNumber,
  selectUsername,
} from '../../../store/auth/auth.reducer';
import { AdminService } from '../../../services/admin.service'; 
import { OfferService } from '../../../services/offer.service';
import { PaginatedResponseDTO, ServiceResponseDTO } from '../../../models/admin.model'; 
import { CommonModule } from '@angular/common';
import { NavBarComponent } from "../../shared/nav-bar/nav-bar.component";
import { Router } from '@angular/router';
import { ServiceCardComponent } from '../../shared/service-card/service-card.component';
import { ImageUrlService } from '../../../services/image.service';
import { FooterComponent } from '../../shared/footer/footer.component';
import { OfferDataDTO } from '../../../models/offer.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NavBarComponent, ServiceCardComponent, FooterComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
 
  username$!: Observable<string | null>;
  phoneNumber$!: Observable<string | null>;

  featuredServices: ServiceResponseDTO[] = []; 
  offers: OfferDataDTO[] = [];
  currentSlide = 0;
  showOffers = false;
  isLoading = true;
  error: string | null = null;

  private _store = inject(Store);
  private _adminService = inject(AdminService); 
  private _offerService = inject(OfferService);
  private _subscription: Subscription = new Subscription();
  private _router = inject(Router)
  public _imageUrlService = inject(ImageUrlService)

  ngOnInit() {
    this.username$ = this._store.select(selectUsername);
    this.phoneNumber$ = this._store.select(selectPhoneNumber);
    
    this.loadFeaturedServices();
    this.loadOffers();
    this.startCarousel();
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
            this.featuredServices = response.items.filter(service => service.status === 'active');
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

  loadOffers() {
    this._subscription.add(
      this._offerService.getAllOffers(1, 10, 'createdAt', 'desc', { status: 'Active' })
        .subscribe({
          next: (response) => {
            if (response.success && response.items) {
              this.offers = response.items.filter((offer: OfferDataDTO) => 
                offer.status === 'Active' && 
                (!offer.valid_until || new Date(offer.valid_until) > new Date())
              );
            }
          },
          error: (error) => {
            console.error('Error loading offers:', error);
          }
        })
    );
  }

  startCarousel() {
    setTimeout(() => {
      if (this.offers.length > 0) {
        this.showOffers = true;
        this.startOfferRotation();
      }
    }, 3000);
  }

  startOfferRotation() {
    if (this.offers.length <= 1) return;

    this._subscription.add(
      interval(4000).subscribe(() => {
        this.nextSlide();
      })
    );
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % (this.offers.length + 1);
    
    if (this.currentSlide === 0) {
      this.showOffers = false;
      setTimeout(() => {
        this.showOffers = true;
        this.currentSlide = 1;
      }, 3000);
    }
  }

  prevSlide() {
    if (this.currentSlide === 0) {
      this.currentSlide = this.offers.length;
    } else {
      this.currentSlide = this.currentSlide - 1;
    }
    
    this.showOffers = this.currentSlide > 0;
  }

  goToSlide(index: number) {
    this.currentSlide = index;
    this.showOffers = index > 0;
  }

  getCurrentOffer(): OfferDataDTO | null {
    if (this.showOffers && this.offers.length > 0 && this.currentSlide > 0) {
      return this.offers[this.currentSlide - 1] || null;
    }
    return null;
  }

  getDiscountText(offer: OfferDataDTO): string {
    return offer.discount_type === 'percentage' 
      ? `${offer.discount_value}% OFF`
      : `₹${offer.discount_value} OFF`;
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