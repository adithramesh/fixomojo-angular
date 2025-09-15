import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';
import { OfferService } from '../../../services/offer.service';
import { OfferDataRequestDTO } from '../../../models/offer.model';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../side-bar/side-bar.component';
import { NavBarComponent } from '../../shared/nav-bar/nav-bar.component';

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

  constructor(
    private fb: FormBuilder,
    private offerService: OfferService,
    private route: ActivatedRoute,
    private router: Router
  ) {

    this.offerForm = this.fb.group({
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
    this.offerId = this.route.snapshot.paramMap.get('id');
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
    this.offerService.getOfferById(this.offerId).subscribe({
      next: (data: any) => {
        const formattedDate = data.valid_until
          ? new Date(data.valid_until).toISOString().split('T')[0]
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

        if (data.offer_type === 'service_category') {
          this.offerForm.get('serviceId')?.setValidators([Validators.required]);
          this.offerForm.get('serviceId')?.updateValueAndValidity();
        }
      },
      error: (error) => {
        console.error('Error loading offer:', error);
      }
    });
  }
}

  onSubmit(): void {
    if (this.offerForm.valid) {
        const formData = this.offerForm.value;
    
        const offerData: OfferDataRequestDTO = {
          ...formData
        };
      if (this.isEditMode && this.offerId) {
        this.offerService.updateOffer(this.offerId, offerData).subscribe(
          () => this.router.navigate(['/offers']),
          (error) => console.error('Error updating offer:', error)
        );
      } else {
        this.offerService.addOffer(offerData).subscribe(
          () => this.router.navigate(['/offers']),
          (error) => console.error('Error adding offer:', error)
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
    this.router.navigate(['/offers']);
  }
}