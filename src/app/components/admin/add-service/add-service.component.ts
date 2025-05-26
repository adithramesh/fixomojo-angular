import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ServiceRequestDTO, ServiceResponseDTO } from '../../../models/admin.model';

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
  mode: 'add' | 'edit' = 'add';
  serviceId: string | null = null;
  private _route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.serviceId = this._route.snapshot.paramMap.get('id');
    console.log('serviceId:', this.serviceId);
    this.mode = this.serviceId ? 'edit' : 'add';

    this.addServiceForm = this._fb.group({
      serviceName: ['', Validators.required],
      description: ['', Validators.required],
      image: ['', Validators.pattern(/^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg))$/i)]
    });

    
    if (this.mode === 'edit' && this.serviceId) {  
      console.log("inside if condition");
      this.loadServiceData(this.serviceId!);
    }
  }

  private loadServiceData(serviceId:string):void{
    this._adminService.getServiceById(serviceId).subscribe({
      next:(service:ServiceResponseDTO)=>{
        console.log('Service data: ',service);
        this.addServiceForm.patchValue({
          serviceName:service.serviceName || '',
          description:service.description || '',
          // createdAt:service.updatedAt,
          // status:service.status
        })
      }
    });
  }

  onSubmit(): void {
    if (this.addServiceForm.valid) {
      // const newServiceData = this.addServiceForm.value;
      // this._adminService.createService(newServiceData).subscribe({
      const { serviceId, ...serviceData} = this.addServiceForm.value as ServiceRequestDTO & {serviceId:string}

      const request$ = this.mode === 'edit' && this.serviceId? this._adminService.updateService(this.serviceId, serviceData) :this._adminService.createService(serviceData)
      request$.subscribe({  
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
