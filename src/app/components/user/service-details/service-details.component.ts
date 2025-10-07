


import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { NavBarComponent } from '../../shared/nav-bar/nav-bar.component';
import { Store } from '@ngrx/store';
import { debounceTime, distinctUntilChanged, Observable, Subject, Subscription } from 'rxjs';
import { selectPhoneNumber, selectUsername } from '../../../store/auth/auth.reducer';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../services/admin.service';
import { PaginationRequestDTO, SubServiceResponseDTO } from '../../../models/admin.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalComponent } from '../../shared/modal/modal.component';
import { ImageUrlService } from '../../../services/image.service';
import { FooterComponent } from '../../shared/footer/footer.component';
import { ServiceCardComponent } from '../../shared/service-card/service-card.component';
import { animate, query, stagger, style, transition, trigger } from '@angular/animations';
import { TableData } from '../../shared/data-table/data-table.component';

@Component({
  selector: 'app-service-details',
  standalone: true,
  imports: [NavBarComponent, ServiceCardComponent, ModalComponent, CommonModule, FooterComponent],
  templateUrl: './service-details.component.html',
  styleUrls: ['./service-details.component.scss'],
  animations: [
    trigger('cardAnimation', [
      transition(':enter', [
        query('.card', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(100, [
            animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class ServiceDetailsComponent implements OnInit, OnDestroy {
  private _store = inject(Store);
  private _adminService = inject(AdminService);
  private _route = inject(ActivatedRoute);
  private _router = inject(Router);
  public _imageUrlService = inject(ImageUrlService);
  private searchSubject = new Subject<string>();
  private _subscription: Subscription = new Subscription();

  username$!: Observable<string | null>;
  phoneNumber$!: Observable<string | null>;
  
  isLoading = false;
  error: string | null = null;
  
  isModalOpen = false;
  modalType: 'service' | 'otp' = 'service';
  selectedService: TableData | null = null;

  subServiceTableData: TableData[] = [];
  searchTerm = '';
  serviceId: string | null = null;
  serviceName: string | null = null;
  
  pagination: PaginationRequestDTO = {
    page: 1,
    pageSize: 10,
    sortBy: 'subServiceName',
    sortOrder: 'asc',
    searchTerm: '',
    filter: {}
  };
  
  totalSubServices = 0;
  totalPages = 0;

  ngOnInit() {
    this.username$ = this._store.select(selectUsername);
    this.phoneNumber$ = this._store.select(selectPhoneNumber);

    // Get route parameters
    this._subscription.add(
      this._route.queryParams.subscribe(params => {
        this.serviceId = params['serviceId'] || null;
        this.serviceName = params['serviceName'] || null;
        
        // Set filter based on available parameters
        if (this.serviceId) {
          this.pagination.filter = { serviceId: this.serviceId };
        } else if (this.serviceName) {
          this.pagination.filter = { serviceName: this.serviceName };
        }
        
        this.loadSubServices();
      })
    );

    this._subscription.add(
      this.searchSubject
        .pipe(
          debounceTime(1000),         
          distinctUntilChanged()      
        )
        .subscribe(searchTerm => {
          this.pagination.searchTerm = searchTerm;
          this.pagination.page = 1;
          this.loadSubServices();
        })
    );
  }

  private loadSubServices() {
    this.isLoading = true;
    this.error = null;
    
    this._subscription.add(
      this._adminService.getSubServices(this.pagination).subscribe({
        next: (response) => {
          this.totalSubServices = response.total;
          this.totalPages = response.totalPages;
          this.subServiceTableData = response.items.map(subService => this.mapSubServiceToTableData(subService));
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading sub-services:', error);
          this.error = 'Failed to load services. Please try again.';
          this.isLoading = false;
        }
      })
    );
  }

  mapSubServiceToTableData(subService: SubServiceResponseDTO): TableData {
    return {
      id: subService.id,
      subServiceName: subService.subServiceName,
      serviceName: subService.serviceName,
      description: subService.description,
      price: subService.price?.toString(),
      status: subService.status,
      image: this._imageUrlService.buildImageUrl(subService.image) || 'assets/images/service-placeholder.jpg'
    };
  }

  onPageChange(newPage: number): void {
    this.pagination.page = newPage;
    this.loadSubServices();
  }

  onSearchChange(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.searchSubject.next(searchTerm);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.pagination.searchTerm = '';
    this.pagination.page = 1;
    this.loadSubServices();
  }

  openModal(service: TableData): void {
    this.selectedService = service;
    this.isModalOpen = true;
    this.modalType = 'service';
    document.body.classList.add('modal-open');
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedService = null;
    document.body.classList.remove('modal-open');
  }

  bookSubService(service: TableData): void {
    const subServiceId = service.id ?? '';
    const subServiceName = service.subServiceName ?? 'Unknown Service';
    const price = service.price ?? '0';

    this._router.navigate(['/book-service'], {
      queryParams: {
        subServiceId,
        subServiceName,
        price
      }
    });
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
    document.body.classList.remove('modal-open');
  }
}