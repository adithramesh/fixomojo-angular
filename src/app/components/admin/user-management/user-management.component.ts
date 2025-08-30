import { Component, inject } from '@angular/core';
import { SidebarComponent } from "../side-bar/side-bar.component";
import { DataTableComponent, TableColumn, TableData } from "../../shared/data-table/data-table.component";
import { debounceTime, distinctUntilChanged, Observable, Subject, Subscription } from 'rxjs';
import { AdminService } from '../../../services/admin.service';
import { Store } from '@ngrx/store';
import { PaginationRequestDTO, UserResponseDTO } from '../../../models/admin.model';
import { selectPhoneNumber, selectUsername } from '../../../store/auth/auth.reducer';
import { NavBarComponent } from "../../shared/nav-bar/nav-bar.component";

@Component({
  selector: 'app-user-management',
  imports: [SidebarComponent, DataTableComponent, NavBarComponent],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent {
  private _store = inject(Store);
  private _adminService = inject(AdminService);
  private subscription: Subscription = new Subscription;
  searchTerm: string=''
  private searchSubject = new Subject<string>()

  username$!: Observable<string | null>;
  phoneNumber$!: Observable<string | null>; 

  userTableColumns: TableColumn[] = [
    { header: 'User name', key: 'username', type: 'text', width: '15%' },
    { header: 'Phone Number', key: 'phoneNumber', type: 'text', width: '15%' },
    { header: 'Email', key: 'email', type: 'text', width: '15%' },
    { header: 'Joining Date', key: 'createdAt', type: 'date', width: '15%' },
    { header: 'Status', key: 'status', type: 'text', width: '10%' },
    { header: 'Change Status', key: 'block', type: 'button', buttonText: 'Change', buttonClass: 'btn-primary', width: '15%' }
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
          this.searchTerm=searchTerm;
          this.pagination.searchTerm = searchTerm; 
          this.pagination.page = 1;
          this.loadUsers();
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
    
    this.subscription = this._adminService.getAppUsers(this.pagination).subscribe({
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
      createdAt: user.createdAt || '',
      edit: 'edit',
      block: 'block'
    };
  }


  handleAction(event: { action: string, item: TableData }): void {
    const userId = event.item.id;

    switch (event.action) {
      case 'edit':
        console.log('Editing user:', userId);
        break;
      case 'block':
        console.log('Blocking user:', userId);
        this._adminService.changeUserStatus(userId).subscribe({
          next:(response:UserResponseDTO)=>{
            const index = this.userTableData.findIndex(user => user.id===userId)
            if(index!==-1){
              this.userTableData[index]={...this.userTableData[index], status:response.status};
            }
          }
        });
        break;
    }
  }
  onPageChange(newPage: number): void {
    this.pagination.page = newPage;
    this.loadUsers();
  }

  onSearchChange(searchTerm: string): void {
    this.searchSubject.next(searchTerm)
  }
}
