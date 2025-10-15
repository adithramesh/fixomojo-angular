import { Component, inject } from '@angular/core';
import { DataTableComponent, TableColumn, TableData } from '../../shared/data-table/data-table.component';
import { PaginationRequestDTO } from '../../../models/admin.model';
import { debounceTime, distinctUntilChanged, Subject, Subscription } from 'rxjs';
import { BookingResponse, BookingService } from '../../../services/booking.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../shared/modal/modal.component';
import { PartnerSideBarComponent } from '../partner-side-bar/partner-side-bar.component';
import { Router } from '@angular/router';
import { selectTempUserId, selectUsername, selectUserRole } from '../../../store/auth/auth.reducer';
import { Store } from '@ngrx/store';
import { ChatService } from '../../../services/chat.service';
import { ConfirmationModalComponent } from '../../shared/confirmation-modal/confirmation-modal.component';


@Component({
  selector: 'app-tasks',
  imports: [CommonModule, FormsModule,  DataTableComponent,ModalComponent, PartnerSideBarComponent, ConfirmationModalComponent],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.scss'
})
export class TasksComponent {
   isLoading = true;
    bookingsTableColumns: TableColumn[] = [
      { header: 'Booking Number', key: 'displayId', type: 'text', width: '15%' },
      { header: 'Customer Name', key: 'username', type: 'text', width: '15%' },
      { header: 'Service Name', key: 'subServiceName', type: 'text', width: '20%' },
      { header: 'Amount', key: 'totalAmount', type: 'text', width: '10%' },
      { header: 'Payment', key: 'paymentStatus', type: 'text', width: '10%' },
      { header: 'Schedule', key: 'timeSlotStart', type: 'date', width: '20%' },
      { header: 'Status', key: 'bookingStatus', type: 'text', width: '10%' },
      { header: 'Work Location', key: 'location', type: 'text', width: '20%' },
      { header: 'Action', key: 'actions', type: 'action-buttons', width: '10%' },

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
    private _router = inject(Router)
    private _store = inject(Store)
    private chatService = inject(ChatService)
    private _currentUserId = ''
    private _role = ''
    private _username = ''
    searchTerm=''

    isModalOpen=false
    modalType:'service' | 'otp' |'chat' = 'otp';
    // otpData:any
    bookingId!:string
    selectedBooking: TableData | null = null ;

    showCancelModal = false;
    cancelModalTitle = '';
    cancelModalMessage = '';
    cancelButtonText = '';
    canCancel = false;
    private bookingToCancel: TableData | null = null;

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
    }
  
    getBookings(): void {
      this.isLoading = true;
      
      this.bookingService.getBookings(this.pagination).subscribe({
        next: (response: BookingResponse) => {
         if (response.success && response.bookingList?.items) {
            this.bookingsTableData = response.bookingList.items.map(booking =>{
                 return this.mapBookingsToTableData(booking)
            } );
            
            
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
        error: (error) => {
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
        username:booking.username,
        subServiceId: booking.subServiceId, 
        subServiceName:booking.subServiceName,
        totalAmount: booking.totalAmount,
        paymentStatus: booking.paymentStatus,
        bookingStatus: booking.bookingStatus,
        timeSlotStart:booking.timeSlotStart!,
        createdAt:booking.createdAt!,
        location:booking.location || '',
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
      switch(event.action) {
        case 'chat':
          this.openChat(event.item);
          break;
        case 'complete':
          this.openOtpModal(event.item);
          break;
        case 'cancel':
          this.prepareAndOpenCancelModal(event.item);
          break;
      }
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
        userRole:'partner',
        userName: booking.username as string,
        serviceName: booking.subServiceName as string
      }, _authToken);

      console.log('Chat opened for booking:', booking);
    } catch (error) {
      console.error('Failed to open chat:', error);
      // can show toast notification here
    }
  }

  private prepareAndOpenCancelModal(booking: TableData): void {
      const timeSlotStart = new Date(booking.timeSlotStart!);
      const now = new Date();
      const timeDifferenceInHours = (timeSlotStart.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      this.bookingToCancel = booking;
      this.showCancelModal = true;
      
      if (timeDifferenceInHours > 24) {
          this.cancelModalTitle = 'Cancel Booking';
          this.cancelModalMessage = `You are eligible to cancel this booking. Are you sure you want to proceed with the cancellation?`;
          this.cancelButtonText = 'Cancel Booking';
          this.canCancel = true; 
      } else {
          this.cancelModalTitle = 'Cancel Booking (No Refund)';
          this.cancelModalMessage = 'This booking cannot be cancelled with as it is within 24 hours. ';
          this.cancelButtonText = 'Cancel Booking';
          this.canCancel = false;
      }
  }

  confirmCancelBooking(): void {
    if (!this.bookingToCancel || !this.bookingToCancel.id) {
      console.error('Booking data is missing.');
      return;
    }
    this.bookingService.cancelBooking(this.bookingToCancel.id as string).subscribe({
      next: (response) => {
        if (response.success) {
          console.log(response.message || 'Booking cancelled successfully!');
          this.getBookings();
        } else {
          console.error(response.message || 'Failed to cancel booking.');
        }
      },
      error: (err) => {
        console.error('Error during cancellation:', err);
      }
    });
    this.cancelModalClosed();
  }

  cancelModalClosed(): void {
      this.showCancelModal = false;
      this.bookingToCancel = null;
      this.canCancel = false;
  }


    private getValidToken(): string | null {
    const _authToken = localStorage.getItem('access_token');
    console.log('Token from localStorage:', _authToken);
    
    if (!_authToken) {
      console.error('No token found');
      return null;
    }

      return _authToken;
    }

    openOtpModal(booking: TableData): void {
    
      this.isModalOpen=true
      this.modalType = 'otp'
      this.selectedBooking = booking;
      this.bookingService.initiateWorkComplete(booking.id as string).subscribe({
      next: (result) => {
        console.log("Work completion initiated:", result);
        //can store any additional data from the result if needed
      },
      error: (error) => {
        console.error('Failed to initiate work completion:', error);
        this.closeModal();
        // Show error message to user
      }
    });
      document.body.classList.add('modal-open');
    }

    closeModal(): void {
      this.isModalOpen = false;
      this.selectedBooking = null;
      document.body.classList.remove('modal-open');
    }

    onOtpVerified(event: {otp: string, bookingData: TableData}): void {
    const { otp, bookingData } = event;
    
    console.log('OTP verified:', otp, 'for booking:', bookingData);
    this.bookingService.verifyWorkComplete(otp, bookingData.id as string).subscribe({
      next: (response) => {
        console.log('Work completed successfully:', response);
        
        // Update the local table data
        const index = this.bookingsTableData.findIndex(b => b.id === bookingData.id);
        if (index !== -1) {
          this.bookingsTableData[index].isCompleted = 'Yes';
          this.bookingsTableData[index].bookingStatus = "Completed";
        }

        const updated = {
          ...bookingData,
          bookingStatus: 'Completed',
          isCompleted: 'Yes'
        };

        console.log("updated", updated);
        

        this.bookingService.emitBookingUpdate(updated)
        
        this.closeModal();
        // this.getBookings();
      },
      error: (error) => {
        console.error('OTP verification failed:', error);
        
      }
    });
  }

    openCancelBooking(booking: TableData): void {
      console.log('Opening cancel model for booking:', booking.id);
    }

    ngOnDestroy(): void {
      this.subscription.unsubscribe();
      document.body.classList.remove('modal-open');
    }
}
