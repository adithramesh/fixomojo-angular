import { AuthState } from "./auth/auth.reducer";
import { BookingState } from "./booking/booking.reducer";


export interface AppState {
  auth: AuthState; 
  booking:BookingState;
}
