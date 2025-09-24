import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Router} from '@angular/router'
import { Subscription, Subject, Observable, debounceTime, distinctUntilChanged } from 'rxjs';
import { PaginationRequestDTO, SubServiceResponseDTO } from '../../../models/admin.model';
import { AdminService } from '../../../services/admin.service';
import { selectUsername, selectPhoneNumber } from '../../../store/auth/auth.reducer';
import { DataTableComponent, TableColumn, TableData } from '../../shared/data-table/data-table.component';
import { SidebarComponent } from '../side-bar/side-bar.component';
import { NavBarComponent } from '../../shared/nav-bar/nav-bar.component';

@Component({
  selector: 'app-sub-service-management',
  imports: [DataTableComponent, NavBarComponent, SidebarComponent],
  templateUrl: './sub-service-management.component.html',
  styleUrl: './sub-service-management.component.scss'
})
export class SubServiceManagementComponent {
  private _store = inject(Store);
  private _router = inject(Router);
  private _adminService = inject(AdminService);
  private _route = inject(ActivatedRoute);
  private _subscription: Subscription = new Subscription();
  private searchSubject = new Subject<string>();

  username$!: Observable<string | null>;
  phoneNumber$!: Observable<string | null>;

  subServiceTableColumns: TableColumn[] = [
    { header: 'Sub-Service Name', key: 'subServiceName', type: 'text', width: '20%' },
    { header: 'Service Name', key: 'serviceName', type: 'text', width: '20%' },
    { header: 'Description', key: 'description', type: 'text', width: '25%' },
    { header: 'Price', key: 'price', type: 'text', width: '10%' },
    { header: 'Status', key: 'status', type: 'text', width: '10%' },
    { header: 'Edit Sub-Service', key: 'edit', type: 'button', buttonText: 'Edit', buttonClass: 'btn-primary', width: '15%' },
    { header: 'Block Sub-Service', key: 'block', type: 'button', buttonText: 'Block', buttonClass: 'btn-primary', width: '15%' }
  ];

  subServiceTableData: TableData[] = [];
  searchTerm = '';
  serviceId: string | null = null; 
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
  isLoading = false;


   ngOnInit() {
    this.username$ = this._store.select(selectUsername);
    this.phoneNumber$ = this._store.select(selectPhoneNumber);

 
    this._subscription.add(
      this._route.queryParams.subscribe(params => {
        this.serviceId = params['serviceId'] || null;
        if (this.serviceId) {
          this.pagination.filter = { serviceId: this.serviceId };
        }
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
        this.pagination.page = 1;
        this.loadSubServices();
      })
    );
  }
  ngOnDestroy() {
    this._subscription.unsubscribe();
  }


    loadSubServices(): void {
    this.isLoading = true;
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
      edit: 'edit',
      block: 'block'
    };
  }

  onSearchChange(searchTerm: string): void {
    this.searchSubject.next(searchTerm);
  }

  onAddSubService(): void {
    const queryParams = this.serviceId ? { serviceId: this.serviceId } : {};
    this._router.navigate(['/sub-service'], { queryParams });
  }

  onPageChange(newPage: number): void {
    this.pagination.page = newPage;
    this.loadSubServices();
  }

  handleAction(event: { action: string, item: TableData }): void {
    const subServiceId = event.item.id;
    switch (event.action) {
      case 'edit':
        this._router.navigate([`/edit-sub-service/${subServiceId}`]).then(success => {
        if (!success) {
          console.error('Navigation to edit-sub-service failed');
        }
      });
        break;
      case 'block':
        this._adminService.changeSubServiceStatus(subServiceId).subscribe({
          next: (response: SubServiceResponseDTO) => {
            const index = this.subServiceTableData.findIndex(subService => subService.id === subServiceId);
            if (index !== -1) {
              this.subServiceTableData[index] = { ...this.subServiceTableData[index], status: response.status };
            }
          }
        });
        break;
    }
  }
}
