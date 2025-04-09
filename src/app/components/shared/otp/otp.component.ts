import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AuthActions } from '../../../store/auth/auth.actions';
import { Observable, Subscription, interval } from 'rxjs';
import { CommonModule } from '@angular/common';
import { 
  selectTempUserId, 
  selectPhoneNumber } from '../../../store/auth/auth.reducer';
import { OtpRequestDTO, OtpResendRequestDTO } from '../../../models/auth.model';

@Component({
  selector: 'app-otp',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.css'],
})
export class OtpComponent implements OnInit, OnDestroy {
  otpForm!: FormGroup;
  timeLeft: number = 600; // 10 minutes in seconds
  timerSubscription!: Subscription;
  tempUserId: string | null = null;
  phoneNumber: string | null = null;

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.initForm();
    // Subscribe to selectors
    this.store.select(selectTempUserId).subscribe(tempUserId => {
      this.tempUserId = tempUserId;
      if (tempUserId && !this.timerSubscription) {
        this.startTimer();
      }
    });
    this.store.select(selectPhoneNumber).subscribe(phoneNumber => {
      this.phoneNumber = phoneNumber;
    });
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  private initForm(): void {
    this.otpForm = new FormGroup({
      otp: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]), // 6-digit OTP
    });
  }

  private startTimer(): void {
    this.timerSubscription = interval(1000).subscribe(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.timerSubscription.unsubscribe();
      }
    });
  }

  get formattedTimeLeft(): string {
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  }

  onVerifyOtp() {
    if (this.otpForm.valid && this.tempUserId) {
      const otpData: OtpRequestDTO = {
        tempUserId: this.tempUserId,
        otp: this.otpForm.value.otp,
      };
      this.store.dispatch(AuthActions.verifyOtp({ otpData }));
    }
  }

  onResendOtp() {
    if (this.tempUserId && this.phoneNumber) {
      const resendData: OtpResendRequestDTO = {
        tempUserId: this.tempUserId,
        phoneNumber: this.phoneNumber,
      };
      this.store.dispatch(AuthActions.resendOtp({ resendData }));
      this.timeLeft = 600; // Reset timer
      if (this.timerSubscription) {
        this.timerSubscription.unsubscribe();
      }
      this.startTimer();
    }
  }
}
