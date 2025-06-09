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

@Component({
  selector: 'app-service-details',
  imports: [NavBarComponent, DataTableComponent, CommonModule],
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


subServiceTableColumns: TableColumn[] = [
    { header: 'Types of services', key: 'serviceName', type: 'text', width: '70%' },
    { header: 'Description', key: 'description', type: 'text', width: '70%' },
    { header: '', key: 'add', type: 'button', buttonText: 'Book', buttonClass: 'btn-primary', width: '30%' }
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
      this._route.params.subscribe(params => {
        // Get serviceId or serviceName from route params
        // this.serviceId = params['serviceId'] || null;
        this.serviceName = params['serviceName'] || null;
        
        console.log('Route params:', {  serviceName: this.serviceName });
        
        // Set filter based on what we have
        if (this.serviceId) {
          this.pagination.filter = { serviceId: this.serviceId };
        } else if (this.serviceName) {
          this.pagination.filter = { serviceName: this.serviceName };
          console.log('this.pagination1', this.pagination);
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
        this.pagination.page = 1; // Reset to first page
        this.loadSubServices();
      })
    );
}


private loadSubServices(){
this.isLoading = true;
    // console.log('this.pagination', this.pagination);
    // console.log('this.searchTerm', this.searchTerm);
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
      // edit: 'edit',
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

bookSubService(event:{action:string, item:TableData }):void{
  const subServiceId = event.item.id
  
  console.log("subServiceId", subServiceId);
  this._router.navigate(['/book-service'], {
      queryParams: {
        subServiceId: subServiceId,
        // subServiceName: subServiceName,
        // price:event.price
      }
      });
}
}
