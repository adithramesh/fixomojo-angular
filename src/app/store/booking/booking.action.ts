import { createActionGroup, emptyProps, props } from "@ngrx/store";

export interface BookingFormData {
  location?: {
    address?: string;
    latitude: number | null;
    longitude: number | null;
  };
  timeSlot: string | null;
  technician: string | null;
  paymentMethod: string | null;
  selectedDate: string;  
  selectedTime:string;
  currentStep: number; 
  appliedDiscount?: number;     
  appliedOfferName?: string;    
  finalAmount?: number ;
  availableTimeSlots?: { id: string; time?: string; startTime: string; endTime: string; }[];   
  subServiceId?: string;
}

export const BookingActions = createActionGroup({
    source:"Booking",
    events:{
        'Update Form Data':props<{formData:Partial<BookingFormData>}>(),
        'Load Form Data':emptyProps(),
        'Clear Form Data':emptyProps()
    }
})