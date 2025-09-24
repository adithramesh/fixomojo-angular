// import { CommonModule } from '@angular/common';
// import { Component, EventEmitter, Input, Output } from '@angular/core';
// import { TableData } from '../data-table/data-table.component';
// import { OtpComponent } from '../otp/otp.component';


// @Component({
//   selector: 'app-modal',
//   imports: [CommonModule, OtpComponent],
//   templateUrl: './modal.component.html',
//   styleUrl: './modal.component.scss',
// })
// export class ModalComponent {
//   @Input() isOpen = false;
//   @Input() serviceData: TableData | null = null;
//   @Input() modalType: 'service' | 'otp' |'chat' = 'service';
//   @Input() otpData?: TableData | null = null;

//   @Output() otpVerified = new EventEmitter<{otp: string, bookingData: TableData}>();
//   // eslint-disable-next-line @angular-eslint/no-output-native
//   @Output() close = new EventEmitter<void>();
//   @Output() bookService = new EventEmitter<TableData>();

//   closeModal(): void {
//     this.close.emit();
//   }

//   onBookService(): void {
//     if (this.serviceData) {
//       this.bookService.emit(this.serviceData);
//       this.closeModal();
//     }
//   }

//   onOtpVerified(otp: string): void {
//     this.otpVerified.emit({otp, bookingData: this.otpData!});
//   }

//   onOtpCancelled(): void {
//     this.closeModal();
//   }
// }


import {
  CommonModule
} from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ElementRef,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {
  TableData
} from '../data-table/data-table.component';
import {
  OtpComponent
} from '../otp/otp.component';


@Component({
  selector: 'app-modal',
  imports: [CommonModule, OtpComponent],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
})
export class ModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() serviceData: TableData | null = null;
  @Input() modalType: 'service' | 'otp' | 'chat' = 'service';
  @Input() otpData ? : TableData | null = null;

  @Output() otpVerified = new EventEmitter < {
    otp: string;
    bookingData: TableData
  } > ();
  // eslint-disable-next-line @angular-eslint/no-output-native
  @Output() close = new EventEmitter < void > ();
  @Output() bookService = new EventEmitter < TableData > ();

  @ViewChild('modalDialog') modalDialog!: ElementRef < HTMLDialogElement > ;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.modalDialog) {
      if (changes['isOpen'].currentValue) {
        // Open the dialog programmatically
        this.modalDialog.nativeElement.showModal();
      } else {
        // Close the dialog programmatically
        this.modalDialog.nativeElement.close();
      }
    }
  }

  // Handle click on the backdrop to close the modal
  handleBackdropClick(event: MouseEvent): void {
    if (event.target === this.modalDialog.nativeElement) {
      this.closeModal();
    }
  }

  closeModal(): void {
    this.close.emit();
  }

  onBookService(): void {
    if (this.serviceData) {
      this.bookService.emit(this.serviceData);
      this.closeModal();
    }
  }

  onOtpVerified(otp: string): void {
    this.otpVerified.emit({
      otp,
      bookingData: this.otpData!
    });
  }

  onOtpCancelled(): void {
    this.closeModal();
  }
}
