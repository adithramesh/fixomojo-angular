import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-service',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './add-service.component.html',
  styleUrl: './add-service.component.scss'
})
export class AddServiceComponent {
  addServiceForm!: FormGroup;
  private _fb = inject(FormBuilder);
  private _adminService = inject(AdminService);

  constructor() {}

  ngOnInit(): void {
    this.addServiceForm = this._fb.group({
      serviceName: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.addServiceForm.valid) {
      const newServiceData = this.addServiceForm.value;
      this._adminService.createService(newServiceData).subscribe({
        next: (response) => {
          // Handle successful service creation (e.g., show a success message, redirect)
          console.log('Service created successfully:', response);
          this.addServiceForm.reset(); //reset the form.
        },
        error: (error) => {
          // Handle error (e.g., show an error message)
          console.error('Error creating service:', error);
        },
      });
    } else {
      // Handle invalid form (e.g., display validation errors)
      console.log('Form is invalid. Please check the fields.');
    }
  }
}
