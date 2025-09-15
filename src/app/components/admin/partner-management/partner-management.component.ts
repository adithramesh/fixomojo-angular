import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription, Observable, Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { PaginationRequestDTO, UserResponseDTO } from '../../../models/admin.model';
import { AdminService } from '../../../services/admin.service';
import { selectUsername, selectPhoneNumber } from '../../../store/auth/auth.reducer';
import { TableColumn, TableData, DataTableComponent } from '../../shared/data-table/data-table.component';
import { NavBarComponent } from "../../shared/nav-bar/nav-bar.component";
import { SidebarComponent } from "../side-bar/side-bar.component";
import { Router } from '@angular/router';

@Component({
  selector: 'app-partner-management',
  imports: [DataTableComponent, NavBarComponent, SidebarComponent],
  templateUrl: './partner-management.component.html',
  styleUrl: './partner-management.component.scss'
})
export class PartnerManagementComponent {
  private _store = inject(Store);
  private _adminService = inject(AdminService);
  private _router = inject(Router)
  private subscription: Subscription = new Subscription;
  searchTerm:string=''
  username$!: Observable<string | null>;
  phoneNumber$!: Observable<string | null>; 
  private searchSubject= new Subject<string>();
  userTableColumns: TableColumn[] = [
    { header: 'Partner name', key: 'username', type: 'text', width: '15%' },
    { header: 'Phone Number', key: 'phoneNumber', type: 'text', width: '15%' },
    { header: 'Email', key: 'email', type: 'text', width: '15%' },
    { header: 'Joining Date', key: 'createdAt', type: 'date', width: '15%' },
    { header: 'License Status',key: 'licenseStatus', type: 'dropdown',
      dropdownOptions: [
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Blocked', value: 'blocked' },
      ],width: '15%'},
    { header: 'Status', key: 'status', type: 'text', width: '10%' },
    { header: 'Change Status', key: 'block', type: 'button', buttonText: 'Change', buttonClass: 'btn-primary', width: '15%' },
    { header: 'Video Call', key: 'videoCall', type: 'button',  buttonText: 'Call',buttonClass: 'btn-success', width: '10%' },
  ];

  userTableData: TableData[] = [];

  pagination: PaginationRequestDTO = {
    page: 1,
    pageSize: 10,
    sortBy: 'username',
    sortOrder: 'asc',
    searchTerm:''
  };
  totalUsers = 0;
  totalPages = 0;
  isLoading = false;
  

  ngOnInit() {
    this.username$ = this._store.select(selectUsername);
    this.phoneNumber$ = this._store.select(selectPhoneNumber); 
    this.subscription.add(this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm=>{
      this.searchTerm=searchTerm
      this.pagination.searchTerm = searchTerm; 
      this.pagination.page = 1
      this.loadUsers()
    }))
    this.loadUsers();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  loadUsers(): void {
    this.isLoading = true;
    
    this.subscription = this._adminService.getPartners(this.pagination).subscribe({
      next: (response) => {
        this.totalUsers = response.total;
        this.totalPages = response.totalPages;
        this.userTableData = response.items.map(user => this.mapUserToTableData(user));
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.isLoading = false;
      }
    });
  }

  mapUserToTableData(user: UserResponseDTO): TableData {
    return {
      id: user.id,
      username: user.username || '', 
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      status: user.status || '',
      licenseStatus: user.licenseStatus || '',
      createdAt: user.createdAt || '',
      edit: 'edit',
      block: 'block',
      videoCall: 'videoCall'
    };
  }


  handleAction(event: { action: string, item: TableData }): void {
    const userId = event.item.id;
    const userName = event.item.username;
      switch (event.action) {
        case 'edit':
          console.log('Editing user:', userId);
          break;
        case 'block':
          console.log('Blocking user:', userId);
          this._adminService.changeUserStatus(userId).subscribe({
            next:(response:UserResponseDTO)=>{
              const index = this.userTableData.findIndex(user=>userId===user.id)
              if(index!==-1){
                this.userTableData[index]={...this.userTableData[index], status:response.status}
              }
            }
          });
          break;
        case 'videoCall':
          console.log('Starting video call with:', userName, userId);
        this._router.navigate(['/video-call', userId]);
          break
    }
  }

  onDropdownChange(event: { itemId: string | number; field: string; newValue: string }) {
    if (event.field === 'licenseStatus') {
      this.updateLicenseStatus(event.itemId, event.newValue);
    }
  }

  updateLicenseStatus(userId: string | number, licenseStatus: string) {  
    this._adminService.changeUserStatus(userId, licenseStatus).subscribe({
      next: (updatedUser) => {
        const index = this.userTableData.findIndex(user => user.id === userId);
        if (index !== -1) {
          this.userTableData[index] = updatedUser;
        }
      },
      error: (err) => {
        console.error('Error updating license status:', err);
        this.loadUsers();
      },
    });
  }

  onPageChange(newPage: number): void {
    this.pagination.page = newPage;
    this.loadUsers();
  }

  onSearchChange(searchTerm: string): void {
    this.searchSubject.next(searchTerm)
  }

  
}
