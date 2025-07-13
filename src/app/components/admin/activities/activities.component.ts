import { Component } from '@angular/core';
import { DataTableComponent, TableColumn, TableData } from '../../shared/data-table/data-table.component';
import { PaginationRequestDTO } from '../../../models/admin.model';
import { debounceTime, distinctUntilChanged, Subject, Subscription } from 'rxjs';
import { BookingResponse, BookingService } from '../../../services/booking.service';
import { NavBarComponent } from '../../shared/nav-bar/nav-bar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-activities',
  imports: [NavBarComponent, DataTableComponent, CommonModule],
  templateUrl: './activities.component.html',
  styleUrl: './activities.component.scss'
})
export class ActivitiesComponent {
   isLoading: boolean = true;
      bookingsTableColumns: TableColumn[] = [
        { header: 'Booking Number', key: 'id', type: 'text', width: '20%' },
        { header: 'Service ID', key: 'subServiceId', type: 'text', width: '15%' }, // Changed to subServiceId
        { header: 'Service Name', key: 'subServiceName', type: 'text', width: '30%' },
        { header: 'Amount', key: 'totalAmount', type: 'text', width: '20%' },
        { header: 'Paid', key: 'paymentStatus', type: 'text', width: '20%' },
        { header: 'Status', key: 'bookingStatus', type: 'text', width: '20%' },
        { header: 'Booking Date', key: 'createdAt', type: 'date', width: '20%' },
        { header: 'Booked For', key: 'timeSlotStart', type: 'date', width: '20%' },
        { header: 'Work Completed', key: 'isCompleted', type: 'text', width: '20%' }
      ];
    
      bookingsTableData: TableData[] = [];
      pagination: PaginationRequestDTO = {
        page: 1,
        pageSize: 7,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        searchTerm: ''
      };
      totalBookings: number = 0;
      totalPages: number = 0;
      error: string | null = null;
      private searchSubject = new Subject<string>()
      private subscription: Subscription = new Subscription;
      searchTerm: string=''
    
      constructor(private bookingService: BookingService) {}
    
      ngOnInit(): void {
     
        // this.bookingService.countBookings().subscribe(count => {
        //   if (count) {
        //    this.totalBookings = count;
        //   }
        // });
    
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
        
        this.bookingService.getAllBookingsForAdmin(this.pagination).subscribe({
          next: (response: BookingResponse) => {
            // Check if response and bookingList exist
           if (response.success && response.bookingList?.items) {
            console.log("bookingList", response.bookingList.items);
            
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
          error: (error: any) => {
            console.error('Failed to fetch bookings:', error);
            this.isLoading = false;
            this.bookingsTableData = [];
            this.totalBookings = 0;
            this.totalPages = 0;
            this.error = 'Failed to fetch bookings. Please try again.';
          }
        });
      }
    
      mapBookingsToTableData(booking: any): TableData {
        console.log("booking", booking._id.toString());
        
        return {
          id: booking._id.toString().slice(18),
          subServiceId: booking.subServiceId.slice(18), // Use subServiceId instead of serviceName
          subServiceName:booking.subServiceName,
          totalAmount: booking.totalAmount.toString(),
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
      }
}
