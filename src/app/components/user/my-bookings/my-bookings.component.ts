import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataTableComponent, TableColumn, TableData } from '../../shared/data-table/data-table.component';
import { BookingResponse, BookingService } from '../../../services/booking.service';
import { NavBarComponent } from '../../shared/nav-bar/nav-bar.component';
import { PaginationRequestDTO } from '../../../models/admin.model';
import { Component, inject, OnInit } from '@angular/core';
import { debounceTime, distinctUntilChanged, filter, Subject, Subscription } from 'rxjs';
import { FooterComponent } from '../../shared/footer/footer.component';
import { ChatService } from '../../../services/chat.service';
import { selectTempUserId, selectUsername, selectUserRole } from '../../../store/auth/auth.reducer';
import { Store } from '@ngrx/store';


@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule, NavBarComponent, DataTableComponent, FooterComponent],
  templateUrl: './my-bookings.component.html',
  styleUrls: ['./my-bookings.component.scss']
})
export class MyBookingsComponent implements OnInit {
  isLoading = true;
  bookingsTableColumns: TableColumn[] = [
    { header: 'Booking Number', key: 'displayId', type: 'text', width: '20%' },
    { header: 'Service ID', key: 'subServiceId', type: 'text', width: '15%' }, // Changed to subServiceId
    { header: 'Service Name', key: 'subServiceName', type: 'text', width: '30%' },
    { header: 'Amount', key: 'totalAmount', type: 'text', width: '15%' },
    { header: 'Paid', key: 'paymentStatus', type: 'text', width: '15%' },
    { header: 'Status', key: 'bookingStatus', type: 'text', width: '15%' },
    { header: 'Booking Date', key: 'createdAt', type: 'date', width: '25%', className: 'booking-date' },
    { header: 'Booked For', key: 'timeSlotStart', type: 'date', width: '20%', className: 'booked-for' },
    // { header: 'Work Completed', key: 'isCompleted', type: 'text', width: '20%' }
    { header: 'Action', key: 'actions', type: 'action-buttons', width: '15%' },
  ];

  bookingsTableData: TableData[] = [];
  pagination: PaginationRequestDTO = {
    page: 1,
    pageSize: 7,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    searchTerm: ''
  };
  totalBookings = 0;
  totalPages = 0;
  error: string | null = null;
  private searchSubject = new Subject<string>()
  private subscription: Subscription = new Subscription;
  private _store = inject(Store)
   private chatService = inject(ChatService)
   private _currentUserId = ''
   private _role = ''
   private _username = ''
  // _authToken = localStorage.getItem('access_token');
  searchTerm=''

  isModalOpen=false
  modalType:'service' | 'otp' |'chat' = 'chat';

  private bookingService = inject(BookingService)


  ngOnInit(): void {

   this._store.select(selectTempUserId).subscribe(id => {
                  if (id) {
                    this._currentUserId = id;
                  }
                });
   this._store.select(selectUsername).subscribe(name => {
                  if (name) {
                    this._username = name;
                  }
                });
     this._store.select(selectUserRole).subscribe(role => {
                  if (role) {
                    this._role = role;
                  }
                });    
    this.subscription.add(this.searchSubject.pipe(
              debounceTime(300),
              distinctUntilChanged()
            ).subscribe(searchTerm=>{
              this.searchTerm=searchTerm;
              this.pagination.searchTerm = searchTerm; 
              this.pagination.page = 1;
              this.getBookings();
            }))
        this.getBookings();

  

    this.subscription.add(
      this.bookingService.bookingUpdated$
        .pipe(filter(updatedBooking => updatedBooking !== null))
        .subscribe((updatedBooking: TableData) => {
          const index = this.bookingsTableData.findIndex(b => b.id === updatedBooking.id)
          if (index !== -1) {
            this.bookingsTableData[index].bookingStatus = updatedBooking.bookingStatus
            this.bookingsTableData[index].isCompleted = updatedBooking.isCompleted
          }
        })
)
    
  }

  getBookings(): void {
    this.isLoading = true;
    
    this.bookingService.getBookings(this.pagination).subscribe({
      next: (response: BookingResponse) => {
        // Check if response and bookingList exist
       if (response.success && response.bookingList?.items) {
       
          this.bookingsTableData = response.bookingList.items.map(booking => this.mapBookingsToTableData(booking));
          // this.totalBookings = response.bookingList.length; // Fallback; update if backend provides total
          this.totalBookings = response.bookingList.total;
          this.totalPages = response.bookingList.totalPages;
          this.error = null;
          this.error = null;
        } else {
          this.bookingsTableData = [];
          this.totalBookings = 0;
          this.totalPages = 0;
          this.error = response.message || 'No bookings found';
        }
        this.isLoading = false;
      },
      error: (error: unknown) => {
        console.error('Failed to fetch bookings:', error);
        this.isLoading = false;
        this.bookingsTableData = [];
        this.totalBookings = 0;
        this.totalPages = 0;
        this.error = 'Failed to fetch bookings. Please try again.';
      }
    });
  }

  mapBookingsToTableData(booking: TableData): TableData {
    
    return {
  
      id: booking.id,
      displayId: typeof booking.id === 'string'
          ? booking.id.slice(18)
          : booking.id?.toString().slice(18),
      subServiceId: booking.subServiceId!.slice(18), 
      subServiceName:booking.subServiceName,
      technicianId:booking.Id,
      totalAmount: booking.totalAmount!.toString(),
      paymentStatus: booking.paymentStatus,
      bookingStatus: booking.bookingStatus,
      timeSlotStart:booking.timeSlotStart,
      createdAt:booking.createdAt,
      isCompleted: booking.isCompleted ? 'Yes' : 'No'
    };
  }

  onPageChange(newPage: number): void {
    this.pagination.page = newPage;
    this.getBookings();
  }

  onSearchChange(searchTerm: string): void {
    this.searchSubject.next(searchTerm)
  }

  onRowAction(event: { action: string; item: TableData }): void {
    console.log('Row action:', event);
    this.openChat(event.item);
  }

    async openChat(booking: TableData): Promise<void> {
    const _authToken=this.getValidToken()
    if (!_authToken || !this._currentUserId || !this._role) {
      console.error('Missing user authentication data');
      return;
    }

    try {
      // Open chat using the service
      await this.chatService.openChat({
        bookingId: booking.id as string,
        userId: this._currentUserId,
        userRole: this._role as 'user' | 'partner',
        customerName: this._username as string,
        serviceName: booking.subServiceName as string
      }, _authToken);

      console.log('Chat opened for booking:', booking.id);
    } catch (error) {
      console.error('Failed to open chat:', error);
      // You could show a toast notification here
    }
  }

  private getValidToken(): string | null {
  const _authToken = localStorage.getItem('access_token');
  
  if (!_authToken) {
    console.error('No token found');
    return null;
  }

    return _authToken;
  }

}