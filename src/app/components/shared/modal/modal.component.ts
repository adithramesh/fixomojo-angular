import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TableData } from '../data-table/data-table.component';
import { OtpComponent } from '../otp/otp.component';


@Component({
  selector: 'app-modal',
  imports: [CommonModule, OtpComponent],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
})
export class ModalComponent {
  @Input() isOpen: boolean = false;
  @Input() serviceData: TableData | null = null;
  @Input() modalType: 'service' | 'otp' |'chat' = 'service';
  @Input() otpData?: TableData | null = null;
  // @Input() chatData: { bookingId: string; senderId: string; role: string } | null = null;

  @Output() otpVerified = new EventEmitter<{otp: string, bookingData: TableData}>();
  @Output() close = new EventEmitter<void>();
  @Output() bookService = new EventEmitter<TableData>();

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
    this.otpVerified.emit({otp, bookingData: this.otpData!});
  }

  onOtpCancelled(): void {
    this.closeModal();
  }
}
