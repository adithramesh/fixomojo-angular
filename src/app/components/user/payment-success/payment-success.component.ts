import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingService } from '../../../services/booking.service';
import { FooterComponent } from '../../shared/footer/footer.component';
import { NavBarComponent } from '../../shared/nav-bar/nav-bar.component';


@Component({
  selector: 'app-payment-success',
  imports: [CommonModule, MatIconModule, FooterComponent, NavBarComponent],
  templateUrl: './payment-success.component.html',
  styleUrl: './payment-success.component.scss'
})
export class PaymentSuccessComponent {
  private _route = inject(ActivatedRoute)
  private _router = inject(Router)
  private _http = inject(HttpClient)
  private _bookingService = inject(BookingService)
  

  bookingDetails:any
  walletMessage: string = '';
  errorMessage!:string | null 

ngOnInit() {
    const type = this._route.snapshot.queryParamMap.get('type');
    const sessionId = this._route.snapshot.queryParamMap.get('session_id');
    const bookingId = this._route.snapshot.queryParamMap.get('booking_id');
    const error = this._route.snapshot.queryParamMap.get('error')


    if (error) {
      this.errorMessage = error; 
    } else if (type === 'card' && sessionId) {
      this.verifyCardPayment(sessionId);
    } else if (type === 'wallet' && sessionId) {
      this.confirmWalletRecharge(sessionId);
    } else if (type === 'wallet-booking' && bookingId) {
      this.loadWalletBooking(bookingId);
    } else {
      this.errorMessage = 'Invalid payment context.';
    }
}
verifyCardPayment(sessionId: string) {
    this._http.get<any>(`http://localhost:3000/user/verify-payment?session_id=${sessionId}`)
        .subscribe({
            next: (response) => {
                console.log("response in verify payment", response);
                
                if (response.success) {
                    this.bookingDetails=response.bookingData
                    console.log('Payment successful:', this.bookingDetails);
                    alert(response.message); 
                    // this.blockSlotAfterPayment()
                     this._bookingService.setBookingData({
                              bookingId: this.bookingDetails._id
                            });
                } else {
                    this.errorMessage=response.message
                    console.error('Payment verification failed:',this.errorMessage);
                    alert(this.errorMessage);
                }
            },
            error: (err:any) => {
                console.error('Error verifying payment:', err);
                alert("Something went wrong while verifying your payment.");
            }
        });
}

confirmWalletRecharge(sessionId: string) {
    this._http.get<any>(`http://localhost:3000/wallet/confirm-wallet?session_id=${sessionId}`)
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.walletMessage = res.message;
          } else {
            this.errorMessage = res.message;
          }
        },
        error: () => this.errorMessage = 'Something went wrong confirming wallet recharge.',
      });
  }

  loadWalletBooking(bookingId: string) {
    this._http.get<any>(`http://localhost:3000/booking/${bookingId}`)
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.bookingDetails = res.data;
            this._bookingService.setBookingData({ bookingId: this.bookingDetails._id });
          } else {
            this.errorMessage = res.message;
          }
        },
        error: () => this.errorMessage = 'Failed to load booking details.',
      });
  }


goHome(){
    this._router.navigate(['/home'])
}
}
