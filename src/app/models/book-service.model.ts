export interface BookServiceRequestDTO {
    userId: string , 
    technicianId:string,
    subServiceId:string|null ,
    location: {
    address?: string;
    latitude: number;
    longitude: number;
    };
    date:Date,
    totalAmount:number,
    paymentMethod:"Cash" | "Card" | "Wallet"
}


export interface BookServiceResponseDTO {
    success?:boolean,
    message:string,
    data?:IBooking
}

export interface IBooking  {
  bookingId?: string ;
  _id?:string;
  userId?: string;
  username?:string;
  subServiceId?: string;
  subServiceName?: string;
  location?: {
    address?: string;
    latitude: number;
    longitude: number;
  };
  technicianId?: string;
  technicianName?:string;
  googleCalendarId?: string;
  googleEventId?: string;
  totalAmount?: number;
  paymentMethod?: "Cash" | "Card" | "Wallet";
  bookingStatus?: "Hold" | "Pending" | "Confirmed" | "Cancelled" | "Completed" | "Failed";
  paymentStatus?: "Pending" | "Success" | "Failed";
  isCompleted?: boolean;
  requiresCash?:boolean;
  timeSlotStart?: string; // ISO date string from backend
  timeSlotEnd?: string;
  checkoutUrl?:string;
  createdAt?: string;
  updatedAt?: string;
}
