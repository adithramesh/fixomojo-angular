import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { ServiceResponseDTO, SubServiceRequestDTO } from '../../../models/admin.model';
import { map, Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-add-sub-service',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-sub-service.component.html',
  styleUrl: './add-sub-service.component.scss'
})
export class AddSubServiceComponent {

  addSubServiceForm!:FormGroup
  private _fb=inject(FormBuilder)
  private _adminService = inject(AdminService)
  services$!: Observable<ServiceResponseDTO[]>;
  mode: 'add' | 'edit' = 'add';
  subServiceId: string | null = null;
  private _route = inject(ActivatedRoute);
  private _router = inject(Router)

  ngOnInit():void{
    this.subServiceId = this._route.snapshot.paramMap.get('id');
    console.log('subServiceId:', this.subServiceId);
    this.mode = this.subServiceId ? 'edit' : 'add';

    this.addSubServiceForm= this._fb.group({
      serviceId:['', Validators.required],
      subServiceName:['', Validators.required],
      price:[0, [Validators.required, Validators.min(0)]],
      description:[],
      image: ['', Validators.pattern(/^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg))$/i)],
      status:['active', Validators.required],

    })

    this.services$ = this._adminService.getServices({page:1, pageSize:100}).pipe(map(response=>response.items),
      map(services => services.filter(service=>service.status === 'active'))
    );

    if (this.mode === 'edit' && this.subServiceId) {
        this.services$.subscribe(services => {
      this.loadSubServiceData(this.subServiceId!);
    });
      // this.loadSubServiceData(this.subServiceId);
    }

  }

  private loadSubServiceData(subServiceId: string): void {
    this._adminService.getSubServiceById(subServiceId).subscribe({
      next: (subService: SubServiceRequestDTO) => {
        console.log('Sub-service data:', subService)
        this.addSubServiceForm.patchValue({
          // serviceId: subService.serviceId,
          serviceId: String(subService.serviceId),
          subServiceName: subService.subServiceName,
          price: subService.price,
          description: subService.description,
          image: subService.image,
          status: subService.status,
        });
        console.log('Form value after patch:', this.addSubServiceForm.value);
      },
      error: (error) => {
        console.error('Error loading sub-service:', error);
        // TODO: Show error toast
      },
    });
  }

  onSubmit(): void {
  if (this.addSubServiceForm.valid) {
    const { serviceId, ...subServiceData } = this.addSubServiceForm.value as SubServiceRequestDTO & { serviceId: string };
    const request$ = this.mode === 'edit' && this.subServiceId
      ? this._adminService.updateSubService(this.subServiceId, subServiceData)
      : this._adminService.createSubService(serviceId, subServiceData);

    request$.subscribe({
      next: () => {
        this.addSubServiceForm.reset({ status: 'active' });
        this._router.navigate(['/service-management'])
        // TODO: Show success toast, e.g., this.mode === 'edit' ? "Sub-service updated" : "Sub-service created"
      },
      error: (error) => {
        console.error('Error:', error);
        // TODO: Show error toast, e.g., "Failed to create/update sub-service"
      },
    });
  } else {
    this.addSubServiceForm.markAllAsTouched();
  }
}

}
