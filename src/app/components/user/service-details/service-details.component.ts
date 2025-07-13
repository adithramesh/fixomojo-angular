import { Component, inject } from '@angular/core';
import { NavBarComponent } from "../../shared/nav-bar/nav-bar.component";
import { Store } from '@ngrx/store';
import { debounceTime, distinctUntilChanged, Observable, pipe, Subject, Subscription, tap } from 'rxjs';
import { selectPhoneNumber, selectUsername } from '../../../store/auth/auth.reducer';
import { TableData, DataTableComponent, TableColumn } from '../../shared/data-table/data-table.component';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../services/admin.service';
import { PaginationRequestDTO, SubServiceResponseDTO } from '../../../models/admin.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalComponent } from '../../shared/modal/modal.component';
import { ImageUrlService } from '../../../services/image.service';

@Component({
  selector: 'app-service-details',
  imports: [NavBarComponent, DataTableComponent, ModalComponent, CommonModule],
  templateUrl: './service-details.component.html',
  styleUrl: './service-details.component.scss'
})
export class ServiceDetailsComponent {
private _store = inject(Store)
username$!:Observable<string | null>
phoneNumber$!:Observable<string | null>
isLoading = false
error!: string | null;
private _adminService = inject(AdminService)
private _subscription:  Subscription = new Subscription();
private _route = inject(ActivatedRoute);
private searchSubject = new Subject<string>();
private _router = inject(Router)
public _imageUrlService = inject(ImageUrlService)
// Modal properties
isModalOpen = false;
modalType: 'service' | 'otp' = 'service';
selectedService: TableData | null = null;

// subServiceTableColumns: TableColumn[] = [
//   { header: '', key: 'image', type: 'image', width: '80px' },
//   { header: 'Types of services', key: 'subServiceName', type: 'text', width: '25%' },
//   { header: 'Description', key: 'description', type: 'text', width: '35%' },
//   { header: 'Amount', key: 'price', type: 'text', width: '15%' },
//   { header: '', key: 'book', type: 'button', buttonText: 'Book', buttonClass: 'btn-primary', width: '15%' }
// ];

subServiceTableColumns: TableColumn[] = [
  { header: '', key: 'image', type: 'image', width: '80px' }, // Fixed width for image
  { header: 'Types of services', key: 'subServiceName', type: 'text', width: '25%' }, // 25% of remaining
  { header: 'Description', key: 'description', type: 'text', width: '40%' }, // More width for description
  { header: 'Amount', key: 'price', type: 'text', width: '15%' }, // 15% of remaining
  { header: '', key: 'book', type: 'button', buttonText: 'Book', buttonClass: 'btn-primary', width: '120px' } // Fixed width for button
];

subServiceTableData: TableData[] = [];
searchTerm: string = '';
serviceId: string | null = null; 
serviceName: string | null = null; 
pagination: PaginationRequestDTO = {
    page: 1,
    pageSize: 10,
    sortBy: 'subServiceName',
    sortOrder: 'asc',
    searchTerm: '',
    filter: {} // Will include serviceId if provided
};
totalSubServices = 0;
totalPages = 0;

ngOnInit(){
this.username$=this._store.select(selectUsername)
this.phoneNumber$=this._store.select(selectPhoneNumber)

this._subscription.add(
  this._route.queryParams.subscribe(params => {
    // Get serviceId or serviceName from query params
    this.serviceId = params['serviceId'] || null;
    this.serviceName = params['serviceName'] || null;
    console.log('Query params:', { serviceId: this.serviceId, serviceName: this.serviceName }); // Debugging line
    // Set filter based on what we have
    if (this.serviceId) {
      console.log('Setting filter with serviceId:', this.serviceId); // Debugging line
      this.pagination.filter = { serviceId: this.serviceId };
    } else if (this.serviceName) {
      this.pagination.filter = { serviceName: this.serviceName };
    }
    console.log('Pagination after setting filter:', this.pagination); // Debugging line
    this.loadSubServices();
  })
);


    this._subscription.add(
      this.searchSubject.pipe(
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe(searchTerm => {
        this.searchTerm = searchTerm;
        this.pagination.searchTerm = searchTerm;
        this.pagination.page = 1; // Reset to first page
        this.loadSubServices();
      })
    );
}


private loadSubServices(){
this.isLoading = true;
    
    // console.log('this.searchTerm', this.searchTerm);
    console.log('Loading subservices with pagination:', this.pagination);
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
      price: subService.price.toString(),
      status: subService.status,
      image: this._imageUrlService.buildImageUrl(subService.image) || 'assets/images/service-placeholder.jpg',
      book: 'book'
    };
  }
onPageChange(newPage: number): void {
    this.pagination.page = newPage;
    this.loadSubServices();
}

onSearchChange(searchTerm: string): void {
    this.searchSubject.next(searchTerm);
}

onRowAction(event: { action: string, item: TableData }): void {
  if (event.action === 'image') {
    // Open modal when image is clicked
    console.log("event",event);
    
    this.openModal(event.item);
  } else if (event.action === 'book') {
    // Direct booking
    this.bookSubService(event.item);
  }
}

openModal(service: TableData): void {
  this.selectedService = service;
  this.isModalOpen = true;
  this.modalType="service"
  // Add class to body for blur effect
  document.body.classList.add('modal-open');
}


closeModal(): void {
  this.isModalOpen = false;
  this.selectedService = null;
  // Remove blur effect
  document.body.classList.remove('modal-open');
}

// bookSubService(event: { action: string, item: TableData }): void {
//   const subServiceId = event.item.id;
//   const subServiceName = event.item['subServiceName'];
//   const price = event.item['price'];

//   this._router.navigate(['/book-service'], {
//     queryParams: {
//       subServiceId,
//       subServiceName,
//       price
//     }
//   });
// }

bookSubService(service: TableData): void {
  const subServiceId = service.id;
  const subServiceName = service['subServiceName'];
  const price = service['price'];

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
  // Clean up modal state
  document.body.classList.remove('modal-open');
}
}
