import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { debounceTime, distinctUntilChanged, Observable, of, Subject, switchMap, takeUntil } from 'rxjs';
import { LocationService } from '../../../services/location.service';
import { Store } from '@ngrx/store';
import { selectTempUserId } from '../../../store/auth/auth.reducer';
import { AdminService } from '../../../services/admin.service';
import { PaginationRequestDTO } from '../../../models/admin.model';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-booking-service',
  imports: [CommonModule, FormsModule],
  templateUrl: './booking-service.component.html',
  styleUrl: './booking-service.component.scss'
})
export class BookingServiceComponent {
bookingForm: FormGroup;
  serviceId: string | null = null;
  currentStep = 1;
  maxSteps = 4;
  currentLatitude?: number;
  currentLongitude?: number;
  errorMessage?: string;
  userLocation!: { address?: string; latitude: number; longitude: number; };
  availableTimeSlots: any[] = [];
  availableTechnicians: any[] = [];
  allTechnicians: any[]=[];
  isLoadingMap = false;
  isLoadingTimeSlots = false;
  isLoadingTechnicians = false;

  // Date selection
  selectedDate: string = '';
  minDate: string = '';
  maxDate: string = '';

    pagination: PaginationRequestDTO = {
      page: 1,
      pageSize: 50,
      sortBy: 'username',
      sortOrder: 'asc',
      searchTerm:'',
      filter:{}
    };

  // Typed location fields
  addressInput: string = '';
  autocompleteSuggestions: any[] = [];
  selectedAddressDetails?: { address: string; latitude: number; longitude: number };
  typedLocationErrorMessage?: string;

  showAddressInputField: boolean = false;
  
  private addressInputChanges = new Subject<string>();
  private _locationService=inject(LocationService)
  private _adminService = inject(AdminService)
  private _store = inject(Store)
  private _userId!:Observable<string|null>
  private _destroy$ = new Subject<void>();
  private route = inject(ActivatedRoute)
  private fb = inject(FormBuilder)
  private http = inject(HttpClient)

  constructor () {
    this.bookingForm = this.fb.group({
      location: ['', Validators.required],
      timeSlot: ['', Validators.required],
      technician: ['', Validators.required],
      paymentMethod: ['', Validators.required]
    });

  }

  ngOnInit(): void {
    this.serviceId = this.route.snapshot.paramMap.get('serviceId');
    // this.loadTimeSlots();
    // this.loadAllTechnicians();

    this._userId=this._store.select(selectTempUserId)
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
  }
  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
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
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      if(this.currentStep===2){
        this.bookingForm.patchValue({timeSlot:null})
        this.availableTimeSlots=[]
      }
      if(this.currentStep === 1){
        this.bookingForm.patchValue({technician:null,timeSlot:null})
        this.availableTechnicians=[]
        this.availableTimeSlots=[]
      }
    }
  }

  nextStep(): void {
    if (this.canProceedToNextStep() && this.currentStep < this.maxSteps) {
      this.currentStep++;
      if(this.currentStep===3){

      }
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
        console.log("Latitude, Longitude:", this.currentLatitude, this.currentLongitude);
        
        // Set user location after getting coordinates
        this.userLocation = { 
          address: 'Current Location', 
          latitude: this.currentLatitude, 
          longitude: this.currentLongitude 
        };
        this.bookingForm.patchValue({ location: this.userLocation.address });
        this.isLoadingMap = false;
        
        // Filter technicians based on new location
        this.loadAllTechnicians()
        // this.filterTechniciansByLocation();
        
        // Clear dependent values when location changes
        this.bookingForm.patchValue({ technician: null, timeSlot: null });
        // this.availableTechnicians=[]
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

  onSelectSuggestion(suggestion: any): void {
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
    this.bookingForm.patchValue({ location: this.userLocation.address });
    
    // Filter technicians based on new location
    this.loadAllTechnicians()
    // this.filterTechniciansByLocation();
    
    // Clear dependent values when location changes
    this.bookingForm.patchValue({ technician: null, timeSlot: null });
    this.availableTimeSlots = [];
  }



  // Step 2: Technicians
  loadAllTechnicians(): void {
    this.isLoadingTechnicians = true;
    
    this._adminService.getPartners(this.pagination).subscribe({
      next: (response) => {
        console.log('Partners response:', response);
        this.allTechnicians = response.items.map(partner => ({
          id: partner.id,
          name: partner.username,
          email: partner.email,
          phoneNumber: partner.phoneNumber,
          rating: 4.5, // Default rating - you might want to get this from backend
          experience: '3 years', // Default experience - you might want to get this from backend
          distance: 0,// calculated using haversine formula-working
          location:partner.location?{
            lat: partner.location.latitude,
            lng: partner.location.longitude
          }:undefined,
          profileImage: ''
        }));
        
        console.log('Processed technicians:', this.allTechnicians);
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

    console.log("filtering technician based on user location, user location -", this.userLocation);

    this.availableTechnicians=this.allTechnicians.map(technician=>{
      const distance = this.calculateDistance(technician.location);
      return {...technician, distance:Math.round(distance*10)/10}
    }).filter(technician=>technician.distance<=10)
    .sort((a,b)=>a.distance-b.distance)
    console.log("Available technician within 10km", this.availableTechnicians);
    
}

  calculateDistance(techLocation: { lat: number; lng: number }): number {
    if (!this.userLocation) return Infinity;
    const R = 6371;
    const dLat = (techLocation.lat - this.userLocation.latitude) * Math.PI / 180;
    const dLng = (techLocation.lng - this.userLocation.longitude) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.userLocation.latitude * Math.PI / 180) * Math.cos(techLocation.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    console.log("R",R);
    console.log("c",c);
    console.log("R * c",R * c);
    
    return R * c;
  }

  onTechnicianSelected(technician: any): void {
    this.bookingForm.patchValue({ technician: technician.id });
     // NEW: Clear the time slot if a new technician is selected
    this.bookingForm.patchValue({ timeSlot: null }); // Clear the value
    this.availableTimeSlots = []; // Clear current time slots

    // Load new slots
    // this.loadTimeSlotsForTechnician(technician.id); 
  }

   // Step 3: Time Slots
//   loadTimeSlotsForTechnician(technicianId: string): void {
//     this.isLoadingTimeSlots = true;
//     this.http.get<{ success: boolean; slots: { start: Date; end: Date }[] }>(
//         `http://localhost:3000/partner/available-slots?technicianId=${technicianId}&date=${new Date().toISOString()}`
//     ).subscribe({
//         next: (response) => {
//             this.availableTimeSlots = response.slots.map(slot => ({
//                 id: `${slot.start.toISOString()}-${slot.end.toISOString()}`, // Generate a unique ID
//                 time: `${slot.start.toLocaleTimeString()} - ${slot.end.toLocaleTimeString()}`,
//                 // available: true,
//             }));
//             this.isLoadingTimeSlots = false;
//         },
//         error: (err) => {
//             console.error('Error loading time slots:', err);
//             this.availableTimeSlots = [];
//             this.isLoadingTimeSlots = false;
//         },
//     });
// }

 onDateSelected(): void {
    if (!this.selectedDate || !this.bookingForm.get('technician')?.value) {
      return;
    }
    
    // Clear existing time slots
    this.availableTimeSlots = [];
    this.bookingForm.patchValue({ timeSlot: null });
    
    // Load time slots for selected technician and date
    this.loadTimeSlotsForTechnicianAndDate(this.bookingForm.get('technician')?.value, this.selectedDate);
  }

  loadTimeSlotsForTechnicianAndDate(technicianId: string, date: string): void {
    this.isLoadingTimeSlots = true;
    const selectedDate = new Date(date);
    
    this.http.get<{ success: boolean; slots: { start: string; end: string }[] }>(
        `http://localhost:3000/partner/available-slots?technicianId=${technicianId}&date=${selectedDate.toISOString()}`
    ).subscribe({
        next: (response) => {
            this.availableTimeSlots = response.slots.map(slot => {
                const startTime = new Date(slot.start);
                const endTime = new Date(slot.end);
                return {
                    id: `${slot.start}-${slot.end}`,
                    time: `${startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })} - ${endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`,
                    startTime: slot.start,
                    endTime: slot.end
                };
            });
            this.isLoadingTimeSlots = false;
        },
        error: (err) => {
            console.error('Error loading time slots:', err);
            this.availableTimeSlots = [];
            this.isLoadingTimeSlots = false;
        },
    });
  }


  onTimeSlotSelected(slot: any): void {
    this.bookingForm.patchValue({ timeSlot: slot.id });
  }

  
  // Step 4: Payment
  onPaymentMethodSelected(method: string): void {
    this.bookingForm.patchValue({ paymentMethod: method });
  }

  // Submit
  onSubmit(): void {
    if (this.canProceedToNextStep()) {
      console.log('Booking Data:', this.bookingForm.value);
      // Call backend to save booking
    }
  }

  // Helper for step titles
  getStepTitle(step: number): string {
    const titles = ['Choose Location', 'Choose Technician','Select Time Slot', 'Payment & Confirm'];
    return titles[step - 1];
  }

  getSelectedTimeSlot(): any {
    const timeSlotId = this.bookingForm.get('timeSlot')?.value;
    return this.availableTimeSlots.find(slot => slot.id === timeSlotId);
  }


  getSelectedTechnician(): any {
    const technicianId = this.bookingForm.get('technician')?.value;
    return this.availableTechnicians.find(tech => tech.id === technicianId);
  }
}
