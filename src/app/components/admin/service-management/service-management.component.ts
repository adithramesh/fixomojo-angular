import { Component, inject } from '@angular/core';
import { DataTableComponent, TableColumn, TableData } from "../../shared/data-table/data-table.component";
import { Store } from '@ngrx/store';
import { Subscription, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { PaginationRequestDTO, ServiceResponseDTO} from '../../../models/admin.model';
import { AdminService } from '../../../services/admin.service';
import { selectUsername, selectPhoneNumber } from '../../../store/auth/auth.reducer';
import { NavBarComponent } from "../../shared/nav-bar/nav-bar.component";
import { SidebarComponent } from "../side-bar/side-bar.component";
import { Router } from '@angular/router';
import { ImageUrlService } from '../../../services/image.service';

@Component({
  selector: 'app-service-management',
  imports: [DataTableComponent, NavBarComponent, SidebarComponent],
  templateUrl: './service-management.component.html',
  styleUrl: './service-management.component.scss'
})
export class ServiceManagementComponent {

  private _store = inject(Store);
  private _router = inject(Router)
  private _adminService = inject(AdminService);
  private _subscription: Subscription = new Subscription();
  private searchSubject = new Subject<string>();
  private _imageUrlService = inject(ImageUrlService)
  searchTerm:string = '';
  username$!: Observable<string | null>;
  phoneNumber$!: Observable<string | null>; 

  serviceTableColumns: TableColumn[] = [
    { header: 'Service name', key: 'serviceName', type: 'text', width: '20%' },
    { header: 'Description', key: 'description', type: 'text', width: '30%' },
    { header: 'Image', key: 'image', type: 'image', width: '10%' },
    { header: 'Created on', key: 'createdAt', type: 'date', width: '20%' },
    { header: 'Status', key: 'status', type: 'text', width: '10%' },
    { header: 'Edit Service', key: 'edit', type: 'button', buttonText: 'Edit', buttonClass: 'btn-primary', width: '15%' },
    { header: 'Block Service', key: 'block', type: 'button', buttonText: 'Block', buttonClass: 'btn-primary', width: '15%' }
  ];

  serviceTableData: TableData[] = [];

  pagination: PaginationRequestDTO = {
    page: 1,
    pageSize: 10,
    sortBy: 'serviceName',
    sortOrder: 'asc',
    searchTerm:''
  };
  totalServices = 0;
  totalPages = 0;
  isLoading = false;

  ngOnInit() {
    this.username$ = this._store.select(selectUsername);
    this.phoneNumber$ = this._store.select(selectPhoneNumber); 
    this._subscription.add(this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm=>{
      this.searchTerm=searchTerm;
      console.log("searchTerm",searchTerm);
      this.pagination.searchTerm = searchTerm; 
      this.pagination.page = 1;
      console.log("loadServices 2 called");
      this.loadServices();
    }))
     console.log("loadServices 1 called");
    this.loadServices();
  }

  ngOnDestroy() {
    if (this._subscription) {
      this._subscription.unsubscribe();
    }
  }

  loadServices(): void {
    this.isLoading = true;
    console.log("this.pagination", this.pagination);
    console.log("this.searchTerm",this.searchTerm);
    this._subscription.add(this._adminService.getServices(this.pagination).subscribe({
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
    })
  )
  }
  mapServiceToTableData(service: ServiceResponseDTO): TableData {
    return {
      id: service.id,
      serviceName: service.serviceName ,
      description:service.description, 
      image: this._imageUrlService.buildImageUrl(service.image),
      status: service.status,
      createdAt:service.createdAt,
      edit: 'edit',
      block: 'block'
    };
  }

  
  handleAction(event: { action: string, item: TableData }): void {
    const serviceId = event.item.id;
      switch (event.action) {
        case 'edit':
          console.log('Editing service:', serviceId);
          this._router.navigate([`/edit-service/${serviceId}`])
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

  onPageChange(newPage: number): void {
    this.pagination.page = newPage;
    this.loadServices();
  }

  onAddService() {
    this._router.navigate(['/add-service'])
  }

  onSearchChange(searchTerm: string): void {
    this.searchSubject.next(searchTerm)
  }

}
