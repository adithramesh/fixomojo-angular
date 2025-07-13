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
    data?:any
}

export interface IBooking {
  _id: string;
  userId: string;
  subServiceId: string;
  subServiceName: string;
  location?: {
    address?: string;
    latitude: number;
    longitude: number;
  };
  technicianId: string;
  googleCalendarId?: string;
  googleEventId?: string;
  totalAmount: number;
  paymentMethod: "Cash" | "Card" | "Wallet";
  bookingStatus: "Hold" | "Pending" | "Confirmed" | "Cancelled" | "Completed" | "Failed";
  paymentStatus: "Pending" | "Success" | "Failed";
  isCompleted?: boolean;
  timeSlotStart: string; // ISO date string from backend
  timeSlotEnd: string;
  createdAt: string;
  updatedAt: string;
}
