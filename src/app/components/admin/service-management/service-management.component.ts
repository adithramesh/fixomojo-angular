import { Component, inject } from '@angular/core';
import { DataTableComponent, TableColumn, TableData } from "../../shared/data-table/data-table.component";
import { Store } from '@ngrx/store';
import { Subscription, Observable } from 'rxjs';
import { PaginationRequestDTO, ServiceResponseDTO} from '../../../models/admin.model';
import { AdminService } from '../../../services/admin.service';
import { selectUsername, selectPhoneNumber } from '../../../store/auth/auth.reducer';
import { NavBarComponent } from "../../shared/nav-bar/nav-bar.component";
import { SidebarComponent } from "../side-bar/side-bar.component";


@Component({
  selector: 'app-service-management',
  imports: [DataTableComponent, NavBarComponent, SidebarComponent],
  templateUrl: './service-management.component.html',
  styleUrl: './service-management.component.scss'
})
export class ServiceManagementComponent {
  private _store = inject(Store);
  private _adminService = inject(AdminService);
  subscription: Subscription | undefined;

  username$!: Observable<string | null>;
  phoneNumber$!: Observable<string | null>; // Fixed: missing $ and type

  serviceTableColumns: TableColumn[] = [
    { header: 'Service name', key: 'serviceName', type: 'text', width: '20%' },
    { header: 'Description', key: 'description', type: 'text', width: '30%' },
    { header: 'Created on', key: 'createdAt', type: 'text', width: '20%' },
    { header: 'Status', key: 'status', type: 'text', width: '10%' },
    { header: 'Edit Service', key: 'edit', type: 'button', buttonText: 'Edit', buttonClass: 'btn-primary', width: '15%' },
    { header: 'Block Service', key: 'block', type: 'button', buttonText: 'Block', buttonClass: 'btn-primary', width: '15%' }
  ];

  serviceTableData: TableData[] = [];

  pagination: PaginationRequestDTO = {
    page: 1,
    pageSize: 10,
    sortBy: 'serviceName',
    sortOrder: 'asc'
  };
  totalServices = 0;
  totalPages = 0;
  isLoading = false;

  ngOnInit() {
    this.username$ = this._store.select(selectUsername);
    this.phoneNumber$ = this._store.select(selectPhoneNumber); 
    this.loadServices();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  loadServices(): void {
    this.isLoading = true;
    
    this.subscription = this._adminService.getServices(this.pagination).subscribe({
      next: (response) => {
        this.totalServices = response.total;
        this.totalPages = response.totalPages;
        this.serviceTableData = response.items.map(service => this.mapServiceToTableData(service));
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading services:', error);
        this.isLoading = false;
      }
    });
  }

  mapServiceToTableData(service: ServiceResponseDTO): TableData {
    return {
      id: service.id,
      serviceName: service.serviceName ,
      description:service.description, 
      status: service.status,
      createdAt:service.createdAt,
      edit: 'edit',
      block: 'block'
    };
  }

  prevPage(): void {
    if (this.pagination.page > 1) {
      this.pagination.page--;
      this.loadServices();
    }
  }

  nextPage(): void {
    if (this.pagination.page < this.totalPages) {
      this.pagination.page++;
      this.loadServices();
    }
  }

  
  handleAction(event: { action: string, item: TableData }): void {
    const serviceId = event.item.id;
      switch (event.action) {
        case 'edit':
          console.log('Editing service:', serviceId);
          break;
        case 'block':
          console.log('Blocking service', serviceId);
          this._adminService.changeServiceStatus(serviceId).subscribe({
            next:(response:ServiceResponseDTO)=>{
              const index=this.serviceTableData.findIndex(service=>service.id === serviceId)
              if(index!==-1){
                this.serviceTableData[index]={...this.serviceTableData[index], status:response.status}
              }
            }
          });
          break;
    }
  }

}
