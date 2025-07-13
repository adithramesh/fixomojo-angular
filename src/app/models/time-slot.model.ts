export interface TimeSlotDTO {
  _id?: string;
  technicianId: string;
  date: string; // Changed to string for easier comparison and backend handling
  startTime: string;
  endTime: string;
  isBooked: boolean;
  booking?: string; // booking ID
}

export interface DaySlotsDTO {
  date: Date;
  dateString: string; // YYYY-MM-DD format
  dayName: string;
  timeSlots: TimeSlotDTO[];
}