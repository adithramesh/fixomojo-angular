// import { Component, inject, OnInit, OnDestroy } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ActivatedRoute, Router } from '@angular/router';
// import { Subscription, Observable, Subject } from 'rxjs';
// import { debounceTime, distinctUntilChanged, filter, switchMap, tap } from 'rxjs/operators';
// import { Store } from '@ngrx/store';

// // Assuming these are your existing DTOs and models
// import { AdminService } from '../../../services/admin.service'; // Adjust path as necessary
// import {
//   PaginatedResponseDTO,
//   PaginationRequestDTO,
//   ServiceResponseDTO, // For parent services
//   SubServiceResponseDTO // For sub-services
// } from '../../../models/admin.model'; // Adjust path as necessary

// // Shared components
// import { NavBarComponent } from '../../shared/nav-bar/nav-bar.component'; // Adjust path
// import { ServiceCardComponent } from '../../shared/service-card/service-card.component'; // Adjust path
// import { DataTableComponent, TableColumn, TableData } from '../../shared/data-table/data-table.component'; // Adjust path
// import { ModalComponent } from '../../shared/modal/modal.component'; // Adjust path

// // Assuming these are from your auth store
// import { selectUsername, selectPhoneNumber } from '../../../store/auth/auth.reducer';

// @Component({
//   selector: 'app-service-explorer',
//   standalone: true,
//   imports: [
//     CommonModule,
//     NavBarComponent,
//     ServiceCardComponent,
//     DataTableComponent,
//     ModalComponent // Make sure to import your ModalComponent
//   ],
//   templateUrl: './service-explorer.component.html', // This will be the combined template
//   styleUrl: './service-explorer.component.scss', // This will be the combined styles
// })
// export class ServiceExplorerComponent implements OnInit, OnDestroy {
//   // --- User Info (Optional, but kept for consistency with HomeComponent) ---
//   username$!: Observable<string | null>;
//   phoneNumber$!: Observable<string | null>;

//   // --- Parent Services (Categories) ---
//   parentServices: ServiceResponseDTO[] = [];
//   selectedParentService: ServiceResponseDTO | null = null;
//   selectedParentServiceId!: string| number; // For highlighting selected card
//   parentServicesLoading = true;
//   parentServicesError: string | null = null;

//   // --- Sub-Services (Table Data) ---
//   subServiceTableData: TableData[] = [];
//   subServicesLoading = false; // Initially false, loads on parent selection
//   subServiceError: string | null = null;

//   // --- DataTable Configuration ---
//   subServiceTableColumns: TableColumn[] = [
//     { header: '', key: 'image', type: 'image', width: '80px' },
//     { header: 'Types of services', key: 'subServiceName', type: 'text', width: '25%' },
//     { header: 'Description', key: 'description', type: 'text', width: '40%' }, // Adjusted width
//     { header: 'Amount', key: 'price', type: 'text', width: '15%' },
//     { header: '', key: 'book', type: 'button', buttonText: 'Book', buttonClass: 'btn-primary', width: '120px' } // Adjusted width
//   ];

//   // --- Pagination & Search for Sub-Services ---
//   pagination: PaginationRequestDTO = {
//     page: 1,
//     pageSize: 10, // Default page size for sub-services table
//     sortBy: 'subServiceName',
//     sortOrder: 'asc',
//     searchTerm: '',
//     // No specific filter here; parentServiceId will be added dynamically for sub-services
//   };
//   totalPages = 0;
//   private searchSubject = new Subject<string>();
//   searchTerm: string = ''; // For the search input binding

//   // --- Modal Properties ---
//   isModalOpen = false;
//   selectedSubServiceForModal: TableData | null = null;


//   // --- Injected Services ---
//   private _store = inject(Store);
//   private _adminService = inject(AdminService); // Using AdminService for both parent/sub
//   private _router = inject(Router);
//   private _activatedRoute = inject(ActivatedRoute); // To read query params

//   private _subscriptions = new Subscription(); // Manage all subscriptions

//   constructor() { }

//   ngOnInit(): void {
//     // 1. Get user data from store
//     this.username$ = this._store.select(selectUsername);
//     this.phoneNumber$ = this._store.select(selectPhoneNumber);

//     // 2. Setup search debounce for sub-services
//     this._subscriptions.add(
//       this.searchSubject.pipe(
//         debounceTime(300),
//         distinctUntilChanged(),
//         tap(searchTerm => {
//           this.pagination.searchTerm = searchTerm;
//           this.pagination.page = 1; // Reset to first page on new search
//           this.loadSubServices(); // Reload sub-services with new search term
//         })
//       ).subscribe()
//     );

//     // 3. Load Parent Services first
//     this.loadParentServices();

//     // 4. Check for query parameters for initial parent service selection
//     this._subscriptions.add(
//       this._activatedRoute.queryParams.subscribe(params => {
//         const initialServiceId = params['serviceId'];
//         if (initialServiceId && this.parentServices.length > 0) {
//           // If parent services are already loaded, try to select
//           this.selectInitialParentService(initialServiceId);
//         } else if (initialServiceId) {
//           // If parent services are not yet loaded, wait for them
//           // This will be handled in loadParentServices or a dedicated handler
//         }
//       })
//     );
//   }

//   /**
//    * Loads all available parent services (categories).
//    * After loading, attempts to select an initial parent service if a query param was provided.
//    */
//   loadParentServices(): void {
//     this.parentServicesLoading = true;
//     this.parentServicesError = null;

//     // Assuming getServices() with no filter returns all parent services
//     // If you have a separate API for categories, use that instead.
//     const parentPagination: PaginationRequestDTO = {
//       page: 1,
//       pageSize: 100, // Fetch enough to cover all categories
//       sortBy: 'serviceName',
//       sortOrder: 'asc',
//       searchTerm: ''
//     };

//     this._subscriptions.add(
//       this._adminService.getServices(parentPagination).pipe(
//         tap(() => this.parentServicesLoading = false)
//       ).subscribe({
//         next: (response: PaginatedResponseDTO<ServiceResponseDTO[]>) => {
//           this.parentServices = response.items.filter(service => service.status === 'active');
//           this.parentServicesError = null;

//           // After parent services are loaded, check if an initial service ID was provided
//           const initialServiceId = this._activatedRoute.snapshot.queryParams['serviceId'];
//           if (initialServiceId) {
//             this.selectInitialParentService(initialServiceId);
//           } else if (this.parentServices.length > 0) {
//             // If no initial ID, select the first parent service by default
//             this.onParentServiceSelect(this.parentServices[0]);
//           }
//         },
//         error: (err) => {
//           console.error('Error loading parent services:', err);
//           this.parentServicesError = 'Failed to load service categories.';
//           this.parentServicesLoading = false;
//         }
//       })
//     );
//   }

//   /**
//    * Attempts to select a parent service based on an initial serviceId from query params.
//    * @param serviceId The ID of the service to select.
//    */
//   private selectInitialParentService(serviceId: string): void {
//     const serviceToSelect = this.parentServices.find(s => s.id === serviceId);
//     if (serviceToSelect) {
//       this.onParentServiceSelect(serviceToSelect);
//     } else {
//       console.warn(`Initial service with ID ${serviceId} not found.`);
//       // Optionally, select the first one or show a message
//       if (this.parentServices.length > 0) {
//         this.onParentServiceSelect(this.parentServices[0]);
//       }
//     }
//   }

//   /**
//    * Handles the selection of a parent service from the cards.
//    * @param service The selected parent service.
//    */
//   onParentServiceSelect(service: ServiceResponseDTO): void {
//     if (this.selectedParentService?.id === service.id && !this.subServiceError && !this.subServicesLoading) {
//       // Avoid reloading if the same service is clicked and already loaded
//       return;
//     }

//     this.selectedParentService = service;
//     this.selectedParentServiceId = service.id || ''; // For `[class.selected]` binding

//     // Reset pagination and search when a new parent service is selected
//     this.pagination.page = 1;
//     this.pagination.searchTerm = '';
//     this.searchTerm = ''; // Clear search input visually

//     this.loadSubServices();
//   }

//   /**
//    * Loads sub-services for the currently selected parent service.
//    */
//   loadSubServices(): void {
//     if (!this.selectedParentService || !this.selectedParentService.id) {
//       this.subServiceTableData = [];
//       this.subServicesLoading = false;
//       this.subServiceError = 'Please select a service category to view sub-services.';
//       this.totalPages = 0;
//       return;
//     }

//     this.subServicesLoading = true;
//     this.subServiceError = null;

//     // Assuming getSubServicesByParentService accepts pagination and parentServiceId
//     this._subscriptions.add(
//       this._adminService.getSubServices(this.selectedParentService.id, this.pagination)
//         .pipe(
//           tap(() => this.subServicesLoading = false)
//         )
//         .subscribe({
//           next: (response: PaginatedResponseDTO<SubServiceResponseDTO[]>) => {
//             // Map SubServiceResponseDTO to TableData format
//             this.subServiceTableData = response.items.map(subService => ({
//               id: subService.id, // Ensure there's an 'id' or 'subServiceId' field for actions
//               image: subService.image || 'assets/placeholder.png',
//               subServiceName: subService.subServiceName,
//               description: subService.description,
//               price: subService.price, // Format as currency if needed later
//               // Add other properties needed for the modal or other columns
//               [subService.id]: subService // Store the full object under its ID for easy retrieval
//             }));
//             this.totalPages = response.totalPages;
//             this.subServiceError = null;
//           },
//           error: (err:any) => {
//             console.error('Error loading sub-services:', err);
//             this.subServiceError = 'Failed to load sub-services for this category.';
//             this.subServiceTableData = [];
//             this.totalPages = 0;
//             this.subServicesLoading = false;
//           }
//         })
//     );
//   }

//   /**
//    * Handles search input changes for the sub-service table.
//    * @param searchTerm The current value of the search input.
//    */
//   onSearchChange(searchTerm: string): void {
//     this.searchSubject.next(searchTerm);
//   }

//   /**
//    * Handles page changes for the sub-service table pagination.
//    * @param newPage The new page number.
//    */
//   onPageChange(newPage: number): void {
//     this.pagination.page = newPage;
//     this.loadSubServices();
//   }

//   /**
//    * Handles actions from the DataTable (e.g., 'Book' button click).
//    * @param event Contains the action (e.g., 'book') and the item (TableData).
//    */
//   onRowAction(event: { action: string, item: TableData }): void {
//     if (event.action === 'book') {
//       this.openModal(event.item);
//     }
//     // Add other actions if your table supports them (e.g., 'viewDetails')
//   }

//   /**
//    * Opens the modal with the selected sub-service data.
//    * @param serviceData The data of the sub-service to display in the modal.
//    */
//   openModal(serviceData: TableData): void {
//     this.selectedSubServiceForModal = serviceData;
//     this.isModalOpen = true;
//   }

//   /**
//    * Closes the modal.
//    */
//   closeModal(): void {
//     this.isModalOpen = false;
//     this.selectedSubServiceForModal = null;
//   }

//   /**
//    * Handles the booking action from the modal.
//    * @param bookingData The data received from the modal's booking event.
//    */
//   bookSubService(bookingData: any): void {
//     console.log('Booking Sub-Service:', bookingData);
//     // Implement your booking logic here (e.g., call a service to book)
//     // After booking, you might want to show a success message or refresh the table
//     this.closeModal(); // Close the modal after booking attempt
//   }

//   /**
//    * Handles potential image loading errors in the table.
//    * (This method would be in DataTableComponent if images are handled generically there,
//    * but can be here if specific image logic is needed.)
//    */
//   onImageError(event: Event): void {
//     const imgElement = event.target as HTMLImageElement;
//     imgElement.src = 'assets/placeholder.png'; // Fallback image
//   }

//   ngOnDestroy(): void {
//     this._subscriptions.unsubscribe(); // Clean up all subscriptions
//   }
// }