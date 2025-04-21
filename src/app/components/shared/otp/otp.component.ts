import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subscription, first, interval, combineLatest } from 'rxjs';
import { AuthActions } from '../../../store/auth/auth.actions';
import { selectTempUserId, selectPhoneNumber, selectError, selectLoading } from '../../../store/auth/auth.reducer';
import { OtpRequestDTO, OtpResendRequestDTO } from '../../../models/auth.model';
import { Clipboard } from '@angular/cdk/clipboard';

@Component({
  selector: 'app-otp',
  standalone: true,
  imports: [CommonModule, RouterModule, AsyncPipe],
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.scss'],
})
export class OtpComponent implements OnInit, OnDestroy, AfterViewInit {
  otpValues: string[] = ['', '', '', ''];
  timeLeft: number = 600; // 10 minutes
  timerSubscription?: Subscription;
  tempUserId$!: Observable<string | null>;
  phoneNumber$!: Observable<string | null>;
  error$!: Observable<any>;
  loading$!: Observable<boolean>;
  verificationContext: 'signup' | 'forgot-password' = 'signup';
  isOtpValid: boolean = false; // Track OTP validity

  @ViewChild('otpForm') otpForm!: ElementRef;

  constructor(
    private store: Store,
    private route: ActivatedRoute,
    private clipboard: Clipboard
  ) {}

  ngOnInit(): void {
    this.tempUserId$ = this.store.select(selectTempUserId);
    this.phoneNumber$ = this.store.select(selectPhoneNumber);
    this.error$ = this.store.select(selectError);
    this.loading$ = this.store.select(selectLoading);
    this.verificationContext = this.route.snapshot.data['context'] || 'signup';
    this.tempUserId$.subscribe(tempUserId => {
      if (tempUserId && !this.timerSubscription) {
        this.startTimer();
      }
    });
    this.loading$.subscribe(loading => console.log('loading state:', loading));
    this.updateOtpValidity(); // Initial check
    console.log('Initial isOtpValid:', this.isOtpValid);
  }

  ngAfterViewInit() {
    // console.log('otpForm initialized:', this.otpForm);
  }

  ngOnDestroy(): void {
    this.timerSubscription?.unsubscribe();
  }

  private startTimer(): void {
    this.timerSubscription = interval(1000).subscribe(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.timerSubscription?.unsubscribe();
      }
    });
  }

  get formattedTimeLeft(): string {
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  }

  handleInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    if (value.length > 1) {
      input.value = value[0];
    }
    if (!/^[0-9]?$/.test(value)) {
      input.value = '';
      this.otpValues[index] = '';
      return;
    }
    this.otpValues[index] = value;
    this.updateOtpValidity(); // Update validity on input
    if (value && index < 3) {
      const nextInput = this.otpForm.nativeElement.querySelector(`#otp-${index + 1}`);
      nextInput?.focus();
    }
  }

  handleKeydown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace' && !this.otpValues[index] && index > 0) {
      const prevInput = this.otpForm.nativeElement.querySelector(`#otp-${index - 1}`);
      prevInput?.focus();
    }
  }

  handlePaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pasteData = event.clipboardData?.getData('text')?.trim() || '';
    if (/^[0-9]{4}$/.test(pasteData)) {
      this.otpValues = pasteData.split('');
      this.otpForm.nativeElement.querySelectorAll('.otp-input').forEach((input: HTMLInputElement, i: number) => {
        input.value = this.otpValues[i];
      });
      this.updateOtpValidity(); // Update validity on paste
    }
  }

  onSubmit(): void {
    console.log('onSubmit triggered with otpValues:', this.otpValues);
    if (this.isOtpValid) {
      combineLatest([this.tempUserId$, this.loading$]).pipe(first()).subscribe(([tempUserId, loading]) => {
        console.log('tempUserId:', tempUserId, 'loading:', loading);
        if (tempUserId) {
          const otpData: OtpRequestDTO = {
            tempUserId,
            otp: this.otpValues.join(''),
            context: this.verificationContext
          };
          console.log('Dispatching verifyOtp with:', otpData);
          this.store.dispatch(AuthActions.verifyOtp({ otpData }));
        } else {
          console.error('tempUserId is null or undefined');
        }
      });
    }
  }

  onVerifyButtonClick(): void {
    console.log('Verify button was clicked!');
    this.onSubmit(); // Trigger onSubmit on click
  }

  // onResendOtp(): void {
  //   this.tempUserId$.subscribe(tempUserId => {
  //     this.phoneNumber$.subscribe(phoneNumber => {
  //       if (tempUserId && phoneNumber) {
  //         const resendData: OtpResendRequestDTO = { tempUserId, phoneNumber };
  //         console.log("resend otp from otp comp",resendData );
          
  //         this.store.dispatch(AuthActions.resendOtp({ resendData }));
  //         this.timeLeft = 600;
  //         this.timerSubscription?.unsubscribe();
  //         this.startTimer();
  //       }
  //     }).unsubscribe();
  //   }).unsubscribe();
  // }

  onResendOtp(): void {
    combineLatest([this.tempUserId$, this.phoneNumber$])
      .pipe(first())
      .subscribe(([tempUserId, phoneNumber]) => {
        console.log("tempuserid, phonenumber in on resendotp front",tempUserId, phoneNumber );
        
        if (tempUserId && phoneNumber) {
          const resendData: OtpResendRequestDTO = { tempUserId, phoneNumber };
          console.log("resend otp from otp comp", resendData);
          this.store.dispatch(AuthActions.resendOtp({ resendData }));
          this.timeLeft = 600;
          this.timerSubscription?.unsubscribe();
          this.startTimer();
        }
      });
  }

  copyOtp(): void {
    const otp = this.otpValues.join('');
    if (otp.length === 4) {
      this.clipboard.copy(otp);
      console.log('OTP copied to clipboard:', otp);
    }
  }

  updateOtpValidity(): void {
    this.isOtpValid = this.otpValues.every(value => value.length === 1);
  }
}