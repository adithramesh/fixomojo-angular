import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { OfferService } from '../../../services/offer.service';

import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../side-bar/side-bar.component';
import { NavBarComponent } from '../../shared/nav-bar/nav-bar.component';
import { ActivatedRoute, Router } from '@angular/router';
import { OfferDataDTO } from '../../../models/offer.model';

@Component({
  selector: 'app-offer-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SidebarComponent, NavBarComponent],
  templateUrl: './offer-form.component.html',
  styleUrls: ['./offer-form.component.scss'],
})
export class OfferFormComponent implements OnInit {
  offerForm: FormGroup;
  isEditMode = false;
  offerId: string | null = null;

  offerTypes = ['global', 'service_category', 'first_time_user'];
  serviceCategories = ['Plumbing Services', 'Electrical Services', 'Cleaning Services']; // Add more as needed
  discountTypes = ['percentage', 'flat_amount'];
  today: string = new Date().toISOString().split('T')[0];

  private _fb=inject(FormBuilder)
  private _offerService=inject(OfferService)
  private _route=inject( ActivatedRoute)
  private _router=inject(Router)


  constructor(
  
  ) {

    this.offerForm = this._fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      offer_type: ['', Validators.required],
      serviceId: [''], // only required when offer_type = service_category
      discount_type: ['', Validators.required],
      discount_value: ['', [Validators.required, Validators.min(1)]], // prevent negative or 0
      max_discount: ['', [Validators.min(1)]],
      min_booking_amount: ['', [Validators.min(1)]],
      valid_until: ['', Validators.required],
    }, { validators: this.maxDiscountValidator });

    this.offerForm.get('offer_type')?.valueChanges.subscribe((type) => {
      const serviceIdControl = this.offerForm.get('serviceId');
      if (type === 'service_category') {
        serviceIdControl?.setValidators([Validators.required]);
      } else {
        serviceIdControl?.clearValidators();
      }
      serviceIdControl?.updateValueAndValidity();
    });

  }

  ngOnInit(): void {
    this.offerId = this._route.snapshot.paramMap.get('id');
    if (this.offerId) {
      this.isEditMode = true;
      this.loadOfferDetails();
    }


      this.offerForm.get('offer_type')?.valueChanges.subscribe((type) => {
      const serviceIdControl = this.offerForm.get('serviceId');
      if (type === 'service_category') {
        serviceIdControl?.setValidators([Validators.required]);
      } else {
        serviceIdControl?.clearValidators();
      }
      serviceIdControl?.updateValueAndValidity();
    });
  }

 loadOfferDetails(): void {
  if (this.offerId) {
    this. _offerService.getOfferById(this.offerId).subscribe({
      next: (data) => {
        const formattedDate = data.data.valid_until
          ? new Date(data.data.valid_until).toISOString().split('T')[0]
          : '';

        this.offerForm.patchValue({
          title: data.data.title,
          description: data.data.description,
          offer_type: data.data.offer_type,
          serviceId: data.data.serviceId || '',
          discount_type: data.data.discount_type,
          discount_value: data.data.discount_value,
          max_discount: data.data.max_discount,
          min_booking_amount: data.data.min_booking_amount,
          valid_until: formattedDate
        });

        if (data.data.offer_type === 'service_category') {
          this.offerForm.get('serviceId')?.setValidators([Validators.required]);
          this.offerForm.get('serviceId')?.updateValueAndValidity();
        }
      },
      error: (error: unknown) => {
        console.error('Error loading offer:', error);
      }
    });
  }
}

  onSubmit(): void {
    if (this.offerForm.valid) {
        const formData = this.offerForm.value;
    
        const offerData: OfferDataDTO = {
          ...formData
        };
      if (this.isEditMode && this.offerId) {
        this. _offerService.updateOffer(this.offerId, offerData).subscribe(
          () => this._router.navigate(['/offers']),
          (error: unknown) => console.error('Error updating offer:', error)
        );
      } else {
        this. _offerService.addOffer(offerData).subscribe(
          () => this._router.navigate(['/offers']),
          (error: unknown) => console.error('Error adding offer:', error)
        );
      }
    }
  }

  maxDiscountValidator(group: FormGroup) {
      const maxDiscount = group.get('max_discount')?.value;
      const minBooking = group.get('min_booking_amount')?.value;
      const discountType = group.get('discount_type')?.value;
      const discountValue = group.get('discount_value')?.value;

      
      if (maxDiscount && minBooking && maxDiscount >= minBooking) {
        return { invalidDiscount: true };
      }

      
      if (discountType === 'percentage' && discountValue > 100) {
        return { percentageExceeds: true };
      }

      return null;
    }



  onCancel(): void {
    this._router.navigate(['/offers']);
  }
}