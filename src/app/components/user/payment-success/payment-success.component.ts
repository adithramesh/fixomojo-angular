import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingService } from '../../../services/booking.service';
import { PaymentService } from '../../../services/payment.service'; // Import the new service
import { FooterComponent } from '../../shared/footer/footer.component';
import { NavBarComponent } from '../../shared/nav-bar/nav-bar.component';
import { TableData } from '../../shared/data-table/data-table.component';
import { BookingActions } from '../../../store/booking/booking.action';
import { Store } from '@ngrx/store';



@Component({
  selector: 'app-payment-success',
  imports: [CommonModule, MatIconModule, FooterComponent, NavBarComponent],
  templateUrl: './payment-success.component.html',
  styleUrl: './payment-success.component.scss'
})
export class PaymentSuccessComponent {
  private _route = inject(ActivatedRoute)
  private _router = inject(Router)
  private _bookingService = inject(BookingService)
  private _paymentService = inject(PaymentService); 
  private _store = inject(Store)

  bookingDetails!: TableData
  walletMessage = '';
  errorMessage!: string | null

  ngOnInit() {
    this._store.dispatch(BookingActions.clearFormData());
    const type = this._route.snapshot.queryParamMap.get('type');
    const sessionId = this._route.snapshot.queryParamMap.get('session_id');
    const bookingId = this._route.snapshot.queryParamMap.get('booking_id');
    const error = this._route.snapshot.queryParamMap.get('error')

    if (error) {
      this.errorMessage = error;
      localStorage.removeItem('bookingData');
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
    this._paymentService.verifyCardPayment(sessionId)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.bookingDetails = response.bookingData!
            // alert(response.message);
            this._bookingService.setBookingData({
              bookingId: this.bookingDetails._id!
            });
          } else {
            this.errorMessage = response.message
            console.error('Payment verification failed:', this.errorMessage);
            alert(this.errorMessage);
          }
        },
        error: (err) => {
          console.error('Error verifying payment:', err);
          this.errorMessage = 'Something went wrong while verifying your payment.';
          alert(this.errorMessage);
        }
      });
  }

  confirmWalletRecharge(sessionId: string) {
    this._paymentService.confirmWalletRecharge(sessionId)
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
    this._paymentService.loadWalletBooking(bookingId)
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.bookingDetails = res.data!;
            this._bookingService.setBookingData({ bookingId: this.bookingDetails._id! }); 
          } else {
            this.errorMessage = res.message;
          }
        },
        error: () => this.errorMessage = 'Failed to load booking details.',
      });
  }


  goHome() {
    this._router.navigate(['/home'])
  }
}