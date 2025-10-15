import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {debounceTime, distinctUntilChanged, Subject, switchMap, takeUntil } from 'rxjs';
import { LocationService } from '../../../services/location.service';
import { Store } from '@ngrx/store';
import { selectTempUserId, selectUsername } from '../../../store/auth/auth.reducer';
import { AdminService } from '../../../services/admin.service';
import { PaginationRequestDTO } from '../../../models/admin.model';
import { HttpClient } from '@angular/common/http';
import { NavBarComponent } from '../../shared/nav-bar/nav-bar.component';
import { BookingService } from '../../../services/booking.service';
import { ImageUrlService } from '../../../services/image.service';
import { BookingPageService } from '../../../services/booking.page.service';
import { IBooking } from '../../../models/book-service.model';
import { BookingActions, BookingFormData } from '../../../store/booking/booking.action';
import { selectFormData } from '../../../store/booking/booking.reducer';



interface TechnicianUI {
  id?: string;
  name: string;
  email: string;
  phoneNumber: string;
  rating: number;
  experience: string;
  distance: number;
  location?: { lat: number; lng: number };
  profileImage: string;
}

@Component({
  selector: 'app-booking-service',
  imports: [CommonModule, FormsModule, NavBarComponent],
  templateUrl: './booking-service.component.html',
  styleUrl: './booking-service.component.scss'
})




export class BookingServiceComponent implements OnInit, OnDestroy {
  bookingForm: FormGroup;
  subServiceId: string | null = null;
  subServiceName: string | null = null;
  technicianId!:string
  price!:number;
  currentStep = 1;
  maxSteps = 4;
  currentLatitude?: number;
  currentLongitude?: number;
  errorMessage?: string;
  userLocation!: { address?: string; latitude: number | null; longitude: number | null; };
  availableTimeSlots:{ id: string; time?: string; startTime: string; endTime: string; }[] = [];
  availableTechnicians:TechnicianUI[] = [];
  allTechnicians:TechnicianUI[] =[];
  isLoadingMap = false;
  isLoadingTimeSlots = false;
  isLoadingTechnicians = false;
  currentBookingId!:string;

  // Date selection
  selectedDate = '';
  selectedTime=''; 
  minDate = '';
  maxDate = '';

    pagination: PaginationRequestDTO = {
      page: 1,
      pageSize: 50,
      sortBy: 'username',
      sortOrder: 'asc',
      searchTerm:'',
      filter:{}
    };

  // Typed location fields
  addressInput = '';
  autocompleteSuggestions:{ display_name: string; lat: string; lon: string; }[] = [];
  selectedAddressDetails?: { address: string; latitude: number; longitude: number };
  typedLocationErrorMessage?: string;
  showAddressInputField = false;

  //offer
  appliedDiscount!:number
  appliedOfferName!:string
  finalAmount!:number

  
  private addressInputChanges = new Subject<string>();
  private _locationService=inject(LocationService)
  private _bookingPageService=inject(BookingPageService)
  private _adminService = inject(AdminService)
  private _store = inject(Store)
  // private _userId!:Observable<string|null>
  private _userId = ''
  private _username = ''
  private _destroy$ = new Subject<void>();
  private _route = inject(ActivatedRoute)
  private _router = inject(Router)
  private fb = inject(FormBuilder)
  private http = inject(HttpClient)
  private _bookingService = inject(BookingService)
  public _imageUrlService = inject(ImageUrlService)
  private reloadSlotsOnTechLoad = false;

  constructor () {
    this.bookingForm = this.fb.group({
       location: this.fb.group({
        address: ['', Validators.required],
        latitude: [null, Validators.required],
        longitude: [null, Validators.required]
      }),
      timeSlot: ['', Validators.required],
      technician: ['', Validators.required],
      paymentMethod: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // this.subServiceId = this._route.snapshot.queryParamMap.get('subServiceId');
     this._route.queryParams.subscribe(params => {
      this.subServiceId = params['subServiceId'] || null;
      this.subServiceName = params['subServiceName'] || null;
      this.price = parseInt(params['price'] ) 
    })

    
      this._store.select(selectTempUserId).subscribe(id => {
            if (id) {
              this._userId = id;
            }
          });
      this._store.select(selectUsername).subscribe(name => {
            if (name) {
              this._username = name;
            }
          });

        this.addressInputChanges.pipe(
          debounceTime(300),
          distinctUntilChanged(),
          switchMap(query => this._locationService.getLocationIqAutocomplete(query)),
          takeUntil(this._destroy$)
        ).subscribe({
          next: (suggestions) => {
            this.autocompleteSuggestions = suggestions;
            this.typedLocationErrorMessage = undefined;
          },
          error: (err) => {
            this.typedLocationErrorMessage = `Error fetching suggestions: ${err.message || 'Unknown error'}`;
            this.autocompleteSuggestions = [];
            console.error(err);
          }
        });

        // Set date limits 
        this.selectedDate = new Date().toISOString().split('T')[0];
        this.minDate = new Date().toISOString().split('T')[0]; // Today
        const maxDateObj = new Date();
        maxDateObj.setMonth(maxDateObj.getMonth() + 3); // 3 months from now
        this.maxDate = maxDateObj.toISOString().split('T')[0];

      this._store.select(selectFormData).subscribe(savedData => {
      if (savedData && savedData.subServiceId === this.subServiceId) {
        // Restore form and local state
         this.availableTimeSlots = (savedData.availableTimeSlots || []).map(slot => ({
          id: slot.id,
          time: slot.time,
          startTime: slot.startTime,
          endTime: slot.endTime
        }));
        this.bookingForm.patchValue(savedData);
        this.userLocation = savedData.location || { address: '', latitude: null, longitude: null };
        this.selectedDate = savedData.selectedDate || this.selectedDate;
        this.selectedTime = savedData.selectedTime || ''; 
        this.currentStep = savedData.currentStep || 1;
        this.appliedDiscount = savedData.appliedDiscount || 0;
        this.appliedOfferName = savedData.appliedOfferName || '';
        this.finalAmount = savedData.finalAmount || this.price;
    
        console.log("savedData.availableTimeSlots", savedData.availableTimeSlots);
        console.log("this.availableTimeSlots", this.availableTimeSlots);
        console.log("this.selectedDate", this.selectedDate);
        console.log("savedData.selectedDate",  savedData.selectedDate);
        
        
        
        // Load technicians if needed
        if (this.currentStep > 1 && this.userLocation?.latitude) {
          this.loadAllTechnicians(); // This will filter based on userLocation
        }
      } else {
        // Fresh start
        this.resetBookingState();
      }
    });
  }



private resetBookingState(): void {
  this.currentStep = 1;
  this.selectedDate = new Date().toISOString().split('T')[0];
  this.userLocation = { address: '', latitude: null, longitude: null };
  this.appliedDiscount = 0;
  this.appliedOfferName = '';
  this.finalAmount = this.price;
  this.availableTimeSlots = [];
  this.availableTechnicians = [];
  this.allTechnicians = [];
}
 
  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
    this._store.dispatch(BookingActions.clearFormData());
  }

  // Step navigation logic
  isStepActive(step: number): boolean {
    return this.currentStep === step;
  }

  isStepCompleted(step: number): boolean {
    return this.currentStep > step;
  }

  canNavigateToStep(step: number): boolean {
    return this.currentStep > step || this.canProceedToNextStep();
  }

  goToStep(step: number): void {
    if (this.canNavigateToStep(step)) {
      this.currentStep = step;
      this.saveFormData();
    }
  }

  public saveFormData() {

  const serializedTimeSlots = this.availableTimeSlots.map(slot => ({
    ...slot,
    
    startTime: new Date(slot.startTime).toISOString(),  // To string
    endTime: new Date(slot.endTime).toISOString(),
  }));
  const data: Partial<BookingFormData> = {
    ...this.bookingForm.value,
    selectedDate: this.selectedDate,
    selectedTime: this.selectedTime,
    currentStep: this.currentStep,
    appliedDiscount: this.appliedDiscount,
    appliedOfferName: this.appliedOfferName,
    finalAmount: this.finalAmount,
    availableTimeSlots: serializedTimeSlots,  
    subServiceId: this.subServiceId,
  };
  this._store.dispatch(BookingActions.updateFormData({ formData: data }));
}

  previousStep(): void {
    if (this.currentStep > 1) {
      if (this.currentStep > 1) {
        if (this.currentStep === 4) {  // From payment
          this.bookingForm.patchValue({ paymentMethod: null });
        } else if (this.currentStep === 3) {  // From time
          this.bookingForm.patchValue({ timeSlot: null });
          this.availableTimeSlots = [];
        } else if (this.currentStep === 2) {  // From technician
          this.bookingForm.patchValue({ technician: null, timeSlot: null });
          this.availableTechnicians = [];
          this.availableTimeSlots = [];
        }
        this.currentStep--;
        this.saveFormData();
      }
    }
  }

  nextStep(): void {
    if (this.canProceedToNextStep() && this.currentStep < this.maxSteps) {
      this.currentStep++;
      this.saveFormData();
      // if(this.currentStep===3){

      // }
    }
  }

  canProceedToNextStep(): boolean {
    switch (this.currentStep) {
      case 1: return !!this.userLocation;
      case 2: return !!this.bookingForm.get('technician')?.value;
      case 3: return !!this.bookingForm.get('timeSlot')?.value;
      case 4: return !!this.bookingForm.get('paymentMethod')?.value;
      default: return false;
    }
  }

  // Step 1: Location
   getCurrentLocation(): void {
    this.isLoadingMap = true;
    this.errorMessage = undefined;
    
    this._locationService.getBrowserCurrentLocation().subscribe({
      next: (coords) => {
        this.currentLatitude = coords.latitude;
        this.currentLongitude = coords.longitude;
        
        // Set user location after getting coordinates
        this.userLocation = { 
          address: 'Current Location', 
          latitude: this.currentLatitude, 
          longitude: this.currentLongitude 
        };
        // this.bookingForm.patchValue({ location: this.userLocation.address });
        this.bookingForm.patchValue({
          location: {
            address: this.userLocation.address,
            latitude: this.userLocation.latitude,
            longitude: this.userLocation.longitude
          }
        });
        this.saveFormData();
        this.isLoadingMap = false;
        
        // Filter technicians based on new location
        this.loadAllTechnicians()
        
        // Clear dependent values when location changes
        this.bookingForm.patchValue({ technician: null, timeSlot: null });
        this.availableTimeSlots = [];
      },
      error: (err) => {
        this.errorMessage = `Error getting location: ${err.message || err}`;
        this.isLoadingMap = false;
        console.error(err);
      }
    });
  }

  onAddressInputChange(value: string): void {
    this.addressInputChanges.next(value);
    this.selectedAddressDetails = undefined;
    this.autocompleteSuggestions = [];
  }

  onSelectSuggestion(suggestion: { display_name: string; lat: string; lon: string; }): void {
    this.addressInput = suggestion.display_name;
    this.selectedAddressDetails = {
      address: suggestion.display_name,
      latitude: parseFloat(suggestion.lat),
      longitude: parseFloat(suggestion.lon)
    };
    this.autocompleteSuggestions = [];
    
    // Set user location from selected address
    this.userLocation = {
      address: this.selectedAddressDetails.address,
      latitude: this.selectedAddressDetails.latitude,
      longitude: this.selectedAddressDetails.longitude
    };
    this.bookingForm.patchValue({
        location: {
          address: this.selectedAddressDetails.address,
          latitude: this.selectedAddressDetails.latitude,
          longitude: this.selectedAddressDetails.longitude
        }
      });
    
    this.saveFormData();
    // Filter technicians based on new location
    this.loadAllTechnicians()

    
    // Clear dependent values when location changes
    this.bookingForm.patchValue({ technician: null, timeSlot: null });
    this.availableTimeSlots = [];
  }



  // Step 2: Technicians
  loadAllTechnicians(): void {
    this.isLoadingTechnicians = true;
    
    this._adminService.getPartners(this.pagination).subscribe({
      next: (response) => {
        this.allTechnicians = response.items
        .filter(partner => partner.status === 'active' && partner.licenseStatus === 'approved')
        .map(partner => ({
          id: String(partner.id ?? ''),
          name: partner.username!,
          email: partner.email!,
          phoneNumber: partner.phoneNumber!,
         
          rating: 4.5, 
          experience: '3 years', 
          distance: 0,// calculated using haversine formula-working
          location: partner.location
            ? { lat: partner.location.latitude, lng: partner.location.longitude }
            : undefined,
          profileImage: this._imageUrlService.buildImageUrl(partner.image)
        }));
        
        this.isLoadingTechnicians = false;
        
        // If user location is already set, filter technicians
        if (this.userLocation) {
          this.filterTechniciansByLocation();
        }
      },
      error: (err) => {
        console.error('Error loading technicians:', err);
        this.isLoadingTechnicians = false;
        this.allTechnicians = [];
        this.availableTechnicians = [];
      }
    });
  }



  filterTechniciansByLocation(): void {
    if (!this.userLocation || !this.allTechnicians.length) {
        this.availableTechnicians = []; // No location, no technicians
        return;
    }


    this.availableTechnicians=this.allTechnicians.map(technician=>{
      const distance = this.calculateDistance(technician.location!);
      return {...technician, distance:Math.round(distance*10)/10}
    }).filter(technician=>technician.distance<=10)
    .sort((a,b)=>a.distance-b.distance)
    
}

  calculateDistance(techLocation: { lat: number; lng: number }): number {
    if (!this.userLocation) return Infinity;
    const R = 6371;
    const dLat = (techLocation.lat - this.userLocation.latitude!) * Math.PI / 180;
    const dLng = (techLocation.lng - this.userLocation.longitude!) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.userLocation.latitude! * Math.PI / 180) * Math.cos(techLocation.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    // console.log("R",R);
    // console.log("c",c);
    // console.log("R * c",R * c);
    
    return R * c;
  }

  onTechnicianSelected(technician:TechnicianUI): void {
    this.bookingForm.patchValue({ technician: technician.id });
    this.bookingForm.patchValue({ timeSlot: null }); 
    this.availableTimeSlots = []; // Clear current time slots
    // this.saveFormData();
    this.onDateSelected()
    // Load new slots
    // this.loadTimeSlotsForTechnician(technician.id); 
  }

   // Step 3: Time Slots

 onDateSelected(): void {
    if (!this.selectedDate || !this.bookingForm.get('technician')?.value) {
      return;
    }
    this.availableTimeSlots = [];
    this.bookingForm.patchValue({ timeSlot: null });
    this.loadTimeSlotsForTechnicianAndDate(this.bookingForm.get('technician')?.value, this.selectedDate);
  }

loadTimeSlotsForTechnicianAndDate(technicianId: string, date: string): void {
  this.isLoadingTimeSlots = true;
  const selectedDate = new Date(date);
  const now = new Date();

 
  // Prevent loading slots for past dates
  if (selectedDate.toDateString() !== now.toDateString() && selectedDate < now) {
    this.availableTimeSlots = [];
    this.isLoadingTimeSlots = false;
    console.log('Cannot load slots for past dates');
    return;
  }

  // this.http.get<{ success: boolean; slots: BackendSlotResponse[] }>(
  //     `http://localhost:3000/partner/available-slots?technicianId=${technicianId}&date=${selectedDate.toISOString()}`
  // ).

  this._bookingPageService.loadTimeSlotsForTechnicianAndDate(technicianId, date)
    .subscribe({
      next: (response) => {
          this.availableTimeSlots = response.slots
              .filter(slot => {
                  // First filter: only 'available' slots
                  if (slot.type !== 'available') return false;
                  
                  // Second filter: remove past slots for current day
                  const startTime = new Date(slot.start);
                  const isToday = selectedDate.toDateString() === now.toDateString();
                  const isPastSlot = isToday && startTime.getTime() < (now.getTime() + 60 * 60 * 1000); // 1 hour buffer
                    // console.log('Slot start:', slot.start);
                    // console.log('StartTime (parsed):', startTime.toISOString());
                    // console.log('Is today:', isToday);
                    // console.log('Is past slot:', isPastSlot);
                  return !isPastSlot;
              })
              .map(slot => {
                  const startTime = new Date(slot.start);
                  const endTime = new Date(slot.end);
                  return {
                      id: `${slot.start}-${slot.end}`,
                      time: `${startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })} - ${endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`,
                      startTime: slot.start,
                      endTime: slot.end,
                  };
  
              })
              .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()); // Sort by start time
              
          this.isLoadingTimeSlots = false;
      },
      error: (err) => {
          console.error('Error loading time slots:', err);
          this.availableTimeSlots = [];
          this.isLoadingTimeSlots = false;
      },
  });
}




  onTimeSlotSelected(selectedSlot: { startTime: string; endTime: string; id: string; time?: string }): void {
    const technicianId=this.bookingForm.get('technician')?.value

  this._bookingPageService.checkTimeSlotAvailability(technicianId, selectedSlot.startTime,selectedSlot.endTime)
  .subscribe({
    next: (response) => {
      if (!response.success) {
        alert(response.message);
        this.bookingForm.patchValue({ timeSlot: null });
        this._router.navigate(['/payment-success'], {
          queryParams: { error: response.message }
        });
      } else {
      
        this.bookingForm.patchValue({ timeSlot: selectedSlot.id });
        this.selectedTime = selectedSlot.time || '';  
        this.saveFormData();
        this._bookingPageService.applyBestOffer(this.price).subscribe({
          next:(response)=>{
            this.appliedDiscount = response.discountAmount;
            this.appliedOfferName = response.appliedOfferName;
            this.finalAmount = response.finalAmount;
            this.saveFormData();
          },
          error:(err)=>{
            console.error("Failed to apply offer:", err);
            this.appliedDiscount = 0;
            this.appliedOfferName = '';
            this.finalAmount = this.price;
          }
        })
        
      }
    },
    error: (err) => {
      console.error('Error checking slot availability:', err);
      alert('Failed to check slot availability.');
      this.bookingForm.patchValue({ timeSlot: null });
    }
  });
}


  
  // Step 4: Payment
  onPaymentMethodSelected(method: string): void {
    this.bookingForm.patchValue({ paymentMethod: method });
    this.saveFormData(); 
  }

  // Submit
  onSubmit(): void {
    if (this.canProceedToNextStep()) {
          const data ={
            userId:this._userId,
            username:this._username,
            technicianId:this.bookingForm.get('technician')?.value as string,
            technicianName:this.getSelectedTechnician()?.name,
            subServiceId:this.subServiceId,
            subServiceName:this.subServiceName,
            location: {
                address: this.bookingForm.get('location.address')?.value,
                latitude: this.bookingForm.get('location.latitude')?.value,
                longitude: this.bookingForm.get('location.longitude')?.value
            },
            date:new Date(),
            totalAmount:this.finalAmount,
            paymentMethod:this.bookingForm.get('paymentMethod')?.value,
            bookedDate:this.selectedDate,
            timeSlotStart: new Date(this.getSelectedTimeSlot()!.startTime), 
            timeSlotEnd: new Date(this.getSelectedTimeSlot()!.endTime)
          }
        this._bookingPageService.submitData(data)

            .subscribe({
                next: (response) => {
                    if (response.success) {
                      const bookingData=response.data;
                        localStorage.setItem('bookingData', JSON.stringify({
                          bookingId: bookingData?._id,
                          username:bookingData?.username,
                          subServiceName:this.subServiceName,
                          technicianId: this.bookingForm.get('technician')?.value,
                          technicianName:bookingData?.technicianName,
                          startTime: bookingData?.timeSlotStart,
                          endTime: bookingData?.timeSlotEnd
                        }));

                       

                        if(bookingData?.requiresCash=== false){
                          this.proceedToPayment(bookingData);
                        }else{
                          this.blockSlotAfterPayment()
                        }

                        //  this._store.dispatch(BookingActions.clearFormData());
                    }else{
                      this._router.navigate(['/payment-success'],{
                        queryParams: { error: response.message }
                      })
                    }
                },
                error: (err) => {
                    console.error('Failed to create booking:', err);
                    alert('Failed to create booking. Please try again.');
                }
            });
            // this._store.dispatch(BookingActions.clearFormData())
    }
}


proceedToPayment(bookingData:IBooking){
  console.log("bookingdata", bookingData);
    if (bookingData.checkoutUrl) {
        window.location.href = bookingData.checkoutUrl;
      
        //wallet logic
    } else {
     
        this._store.dispatch(BookingActions.clearFormData());
        console.log('Wallet payment confirmed. Redirecting to success page.');
        this._router.navigate(['/payment-success'], {
          queryParams: {
            booking_id: bookingData._id,
            type: 'wallet-booking'
          }
        });
        }
  
}

private blockSlotAfterPayment(): void {
    const selectedSlot = this.getSelectedTimeSlot();
    const technicianId = this.bookingForm.get('technician')?.value;
    
    const blockSlotPayload = {
        technicianId: technicianId as string,
        start: selectedSlot!.startTime!,
        end: selectedSlot!.endTime!,
        isCustomerBooking: true,
        reason: `Customer booking - ${this.currentBookingId}`,
        bookingId: this.currentBookingId, 
  
    };
    

    this._bookingPageService.blockSlotAfterPayment(blockSlotPayload)
        .subscribe({
            next: (response) => {
                if (response.success) {
                  console.log('Booking fully confirmed!');
                  this._store.dispatch(BookingActions.clearFormData());  
                
                }
            },
            error: (err) => {
                console.error('Failed to block slot after payment:', err);
          
            }
        });
}


  // Helper for step titles
  getStepTitle(step: number): string {
    const titles = ['Choose Location', 'Choose Technician','Select Time Slot', 'Payment & Confirm'];
    return titles[step - 1];
  }

  getSelectedTimeSlot(){
    const timeSlotId = this.bookingForm.get('timeSlot')?.value;
    return this.availableTimeSlots.find(slot => slot.id === timeSlotId);
  }


  getSelectedTechnician() {
    this.technicianId = this.bookingForm.get('technician')?.value;
    return this.availableTechnicians.find(tech => tech.id === this.technicianId);
  }



  applyBestOffer(price:number){
    return this._bookingPageService.applyBestOffer(price)
  }

}
