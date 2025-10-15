import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';

@Component({
  selector: 'app-confirmation-modal',
  imports: [CommonModule],
  templateUrl: './confirmation-modal.component.html',
  styleUrl: './confirmation-modal.component.scss'
})
export class ConfirmationModalComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirm Action';
  @Input() message = 'Are you sure you want to proceed?';
  @Input() confirmButtonText = 'Confirm';
  @Input() canConfirm = true;

  @Output() confirm = new EventEmitter<void>();
  // eslint-disable-next-line @angular-eslint/no-output-native
  @Output() cancel = new EventEmitter<void>();
  // eslint-disable-next-line @angular-eslint/no-output-native
  @Output() close = new EventEmitter<void>();

  @ViewChild('modalDialog') modalDialog!: ElementRef<HTMLDialogElement>;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.modalDialog) {
      if (changes['isOpen'].currentValue) {
        this.modalDialog.nativeElement.showModal();
      } else {
        this.modalDialog.nativeElement.close();
      }
    }
  }

  onConfirm(): void {
    this.confirm.emit();
    this.closeModal();
  }

  onCancel(): void {
    this.cancel.emit();
    this.closeModal();
  }

  closeModal(): void {
    this.close.emit();
  }
}
