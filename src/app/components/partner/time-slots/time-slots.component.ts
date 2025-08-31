import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { selectTempUserId } from '../../../store/auth/auth.reducer'; 
import { Observable, Subject, takeUntil } from 'rxjs';
import { NavBarComponent } from '../../shared/nav-bar/nav-bar.component';
import { PartnerSideBarComponent } from '../partner-side-bar/partner-side-bar.component';


interface TimeSlotDisplay {
  start: string; 
  end: string;   
  time: string;  
  type: 'available' | 'customer-booked' | 'technician-blocked';
  isAvailable: boolean; 
  isEditable: boolean;  
  googleEventId?: string; 
  reason?: string; 
}

@Component({
  selector: 'app-time-slot',
  standalone: true,
  imports: [CommonModule, FormsModule,NavBarComponent, PartnerSideBarComponent],
  templateUrl: './time-slots.component.html',
  styleUrl: './time-slots.component.scss' 
})
export class TimeSlotsComponent implements OnInit, OnDestroy {

  private readonly API_BASE_URL = 'http://localhost:3000/partner'; 

  selectedDate: string;
  minDate: string;
  maxDate: string;

  availableSlots: TimeSlotDisplay[] = [];
  selectedSlotToBlock?: TimeSlotDisplay; 
  blockReason: string = '';

  isBlockingMultiDay: boolean = false; 
  multiDayStartDate: string;
  multiDayEndDate: string;
  multiDayReason: string = '';

  isLoadingSlots: boolean = false;
  isLoadingBlocking: boolean = false;
  isLoadingUnblocking: boolean = false;

  errorMessage: string | null = null;
  successMessage: string | null = null;

  private _technicianId: string | null = null;
  private _userId$: Observable<string | null>;
  private _destroy$ = new Subject<void>();

  private http = inject(HttpClient);
  private store = inject(Store); 

  constructor() {

    const today = new Date();
    this.minDate = this.formatDate(today);

    const maxDate = new Date();
    maxDate.setMonth(today.getMonth() + 3); 
    this.maxDate = this.formatDate(maxDate);

    this.selectedDate = this.minDate; // Default to today

    // Initialize multi-day dates
    this.multiDayStartDate = this.minDate;
    this.multiDayEndDate = this.minDate;

    this._userId$ = this.store.select(selectTempUserId);
  }

  ngOnInit(): void {
    this._userId$.pipe(
      takeUntil(this._destroy$)
    ).subscribe(id => {
      this._technicianId = id;
      if (this._technicianId) {
        this.onDateChange(); 
      } else {
        this.errorMessage = 'Technician ID not found. Please log in.';
      }
    });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

 

  onDateChange(): void {
    this.selectedSlotToBlock = undefined; 
    this.blockReason = ''; 
    this.errorMessage = null;
    this.successMessage = null;
    if (this._technicianId && this.selectedDate) {
      this.loadAvailableSlots(this.selectedDate);
    }
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  loadAvailableSlots(date: string): void {
    if (!this._technicianId) {
      this.errorMessage = 'Technician ID is missing.';
      return;
    }

    this.isLoadingSlots = true;
    this.availableSlots = []; 

    this.http.get<{ success: boolean; slots: { start: string; end: string; id?: string; type: string; reason?: string }[] }>(
      `${this.API_BASE_URL}/available-slots?technicianId=${this._technicianId}&date=${date}`
    ).subscribe({
      next: (response) => {
        if (response.success && response.slots) {
          const now = new Date();
          const selectedDay = new Date(date);
          this.availableSlots = response.slots.map(slot => {
            const startTime = new Date(slot.start);
            const endTime = new Date(slot.end);
            const isPastSlot = selectedDay.toDateString() === now.toDateString() &&
                               startTime.getTime() < (now.getTime() + 60 * 60 * 1000); 

            let isAvailable = slot.type === 'available';
            let isEditable = slot.type === 'available' || slot.type === 'technician-blocked';

           
            if (isPastSlot) {
              isAvailable = false;
              isEditable = false; 
            }
            
            return {
              start: slot.start,
              end: slot.end,
              time: `${startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })} - ${endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`,
              type: slot.type as 'available' | 'customer-booked' | 'technician-blocked',
              isAvailable: isAvailable,
              isEditable: isEditable,
              googleEventId: slot.id, 
              reason: slot.reason
            };
          });
        
          this.availableSlots.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

        } else {
          this.errorMessage = response.slots ? 'No slots found for this day.' : 'Failed to load slots.';
        }
        this.isLoadingSlots = false;
      },
      error: (err) => {
        console.error('Error loading time slots:', err);
        this.errorMessage = `Error loading slots: ${err.message || 'Server error'}`;
        this.isLoadingSlots = false;
      }
    });
  }

  onSelectSlot(slot: TimeSlotDisplay): void {
    if (!slot.isEditable) {
      return; 
    }
    this.selectedSlotToBlock = slot;
    this.blockReason = slot.type === 'technician-blocked' && slot.reason ? slot.reason : ''; // Pre-fill reason if unblocking
    this.errorMessage = null; 
    this.successMessage = null; 
  }

  

  blockOrUnblockSelectedSlot(): void {
    if (!this.selectedSlotToBlock || !this._technicianId) {
      this.errorMessage = 'Please select a slot and ensure technician ID is available.';
      return;
    }
    if (!this.blockReason && this.selectedSlotToBlock.type === 'available') {
        this.errorMessage = 'Reason is required to block a slot.';
        return;
    }

    if (this.selectedSlotToBlock.type === 'available') {
      this.blockSingleSlot(this.selectedSlotToBlock, this.blockReason);
    } else if (this.selectedSlotToBlock.type === 'technician-blocked' && this.selectedSlotToBlock.googleEventId) {
      this.unblockSingleSlot(this.selectedSlotToBlock.googleEventId);
    }
  }

  private blockSingleSlot(slot: TimeSlotDisplay, reason: string): void {
    this.isLoadingBlocking = true;
    this.errorMessage = null;
    this.successMessage = null;

    const payload = {
      technicianId: this._technicianId,
      start: slot.start,
      end: slot.end,
      reason: reason,
      isCustomerBooking:false,
    };
    console.log("insid blocking slot");
    

    this.http.post<{ success: boolean; message: string; eventId?: string | null }>(
      `${this.API_BASE_URL}/block-slot`, payload
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = response.message;
          this.onDateChange(); 
          this.selectedSlotToBlock = undefined; 
          this.blockReason = '';
        } else {
          this.errorMessage = response.message || 'Failed to block slot.';
        }
        this.isLoadingBlocking = false;
      },
      error: (err) => {
        console.error('Error blocking slot:', err);
        this.errorMessage = `Error blocking slot: ${err.error?.message || err.message || 'Server error'}`;
        this.isLoadingBlocking = false;
      }
    });
  }

  private unblockSingleSlot(googleEventId: string): void {
    // console.log("googleEventId", googleEventId);
    
    this.isLoadingUnblocking = true;
    this.errorMessage = null;
    this.successMessage = null;

   
    this.http.delete<{ success: boolean; message: string }>(
      `${this.API_BASE_URL}/unblock-slot/${this._technicianId}/${googleEventId}`
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = response.message;
          this.onDateChange(); // Reload slots
          this.selectedSlotToBlock = undefined; // Clear selected
          this.blockReason = '';
        } else {
          this.errorMessage = response.message || 'Failed to unblock slot.';
        }
        this.isLoadingUnblocking = false;
      },
      error: (err) => {
        console.error('Error unblocking slot:', err);
        this.errorMessage = `Error unblocking slot: ${err.error?.message || err.message || 'Server error'}`;
        this.isLoadingUnblocking = false;
      }
    });
  }

  // --- Multi-Day Blocking ---

  toggleMultiDayBlock(): void {
    this.isBlockingMultiDay = !this.isBlockingMultiDay;
    this.multiDayStartDate = this.minDate;
    this.multiDayEndDate = this.minDate;
    this.multiDayReason = '';
    this.errorMessage = null;
    this.successMessage = null;
  }

  blockMultiDaySlots(): void {
    if (!this._technicianId) {
      this.errorMessage = 'Technician ID is missing.';
      return;
    }
    if (!this.multiDayStartDate || !this.multiDayEndDate || !this.multiDayReason) {
      this.errorMessage = 'All fields (Start Date, End Date, Reason) are required for multi-day blocking.';
      return;
    }
    if (new Date(this.multiDayStartDate) > new Date(this.multiDayEndDate)) {
      this.errorMessage = 'End Date cannot be before Start Date.';
      return;
    }

    this.isLoadingBlocking = true;
    this.errorMessage = null;
    this.successMessage = null;

    const payload = {
      technicianId: this._technicianId,
      startDate: this.multiDayStartDate, 
      endDate: this.multiDayEndDate,     
      reason: this.multiDayReason,
      isFullDay: true 
    };

    this.http.post<{ success: boolean; message: string }>(
      `${this.API_BASE_URL}/block-multi-day-slots`, payload 
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = response.message;
          this.onDateChange();
          this.toggleMultiDayBlock(); 
        } else {
          this.errorMessage = response.message || 'Failed to block multiple days.';
        }
        this.isLoadingBlocking = false;
      },
      error: (err) => {
        console.error('Error blocking multi-day slots:', err);
        this.errorMessage = `Error blocking days: ${err.error?.message || err.message || 'Server error'}`;
        this.isLoadingBlocking = false;
      }
    });
  }

  // --- Google Calendar Link ---

  get googleCalendarLink(): string {
    // You would ideally get the technician's actual Google Calendar email from the backend
    // or from a user profile service after authentication.
    // For now, let's use a placeholder or assume it's part of the technician object if retrieved.
    const technicianEmail = 'your-technician-email@example.com'; // Replace with actual technician email
    return `https://calendar.google.com/calendar/r?tab=mc&src=${technicianEmail}`;
  }
}