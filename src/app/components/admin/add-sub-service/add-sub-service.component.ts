import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { ServiceResponseDTO, SubServiceRequestDTO } from '../../../models/admin.model';
import { map, Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { FilePondModule, registerPlugin } from 'ngx-filepond';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import FilePondPluginImageResize from 'filepond-plugin-image-resize';
import FilePondPluginImageTransform from 'filepond-plugin-image-transform';
import { ImageUrlService } from '../../../services/image.service';
import { NavBarComponent } from '../../shared/nav-bar/nav-bar.component';
import { SidebarComponent } from '../side-bar/side-bar.component';
import { FilePondInitialFile } from 'filepond';


registerPlugin(FilePondPluginImagePreview, FilePondPluginImageResize, FilePondPluginImageTransform);

@Component({
  selector: 'app-add-sub-service',
  imports: [CommonModule, ReactiveFormsModule, FilePondModule, NavBarComponent, SidebarComponent],
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
  private _imageUrlService = inject(ImageUrlService)
  isSubmitting=false;
  file: File | null = null;
  pondFiles: FilePondInitialFile[] = [];

  pondOptions = {
    allowMultiple: false,
    allowImagePreview: true,
    allowReplace: true,
    acceptedFileTypes: ['image/*'],
    labelIdle: 'Click to upload or drag and drop<br><span class="filepond--label-action">Browse</span>',
    imageResizeTargetWidth: 300,
    imageResizeTargetHeight: 200,
    imageResizeMode: 'cover'
  };
  


  ngOnInit():void{
    this.subServiceId = this._route.snapshot.paramMap.get('id');
    console.log('subServiceId:', this.subServiceId);
    this.mode = this.subServiceId ? 'edit' : 'add';

    this.addSubServiceForm= this._fb.group({
      serviceId:['', Validators.required],
      subServiceName:['', Validators.required],
      price:[0, [Validators.required, Validators.min(0)]],
      description:[],
      image: ['', Validators.pattern(/^sub-services\/[a-zA-Z0-9_-]+$/)],
      status:['active', Validators.required],

    })

    this.services$ = this._adminService.getServices({page:1, pageSize:100}).pipe(map(response=>response.items),
      map(services => services.filter(service=>service.status === 'active'))
    );
    console.log('Form Validity:', this.addSubServiceForm.valid);
   console.log('Form Controls:', this.addSubServiceForm.controls);

    if (this.mode === 'edit' && this.subServiceId) {
        this.services$.subscribe(() => {
      this.loadSubServiceData(this.subServiceId!);
    })}
  }

  private loadSubServiceData(subServiceId: string): void {
    this._adminService.getSubServiceById(subServiceId).subscribe({
      next: (subService: SubServiceRequestDTO) => {
        this.addSubServiceForm.patchValue({
          serviceId: subService.serviceId,
          subServiceId:subServiceId,
          subServiceName: subService.subServiceName,
          price: subService.price,
          description: subService.description,
          image: subService.image,
          status: subService.status,
        });
        if (subService.image) {
          const fullImageUrl = this._imageUrlService.buildImageUrl(subService.image);
          this.pondFiles = [{
            source: fullImageUrl,
            options: {
              type: 'local',
              // size: 500000
            },
            //  metadata: {
            //   poster: fullImageUrl 
            // }
          }];
        }
        console.log('Form value after patch:', this.addSubServiceForm.value);
      },
      error: (error) => {
        console.error('Error loading sub-service:', error);
        // TODO: Show error toast
      },
    });
  }

 

 pondHandleAddFile(event: { file: File }): void { 
    // console.log("pondHandleAddFile", event),event.file;
    this.file = event.file || null;
  }

  pondHandleRemoveFile(): void {
    console.log("pondHandleRemoveFile, file",this.file );
    this.file = null;
  }

  onSubmit(): void {
  if (this.addSubServiceForm.valid) {
    this.isSubmitting = true;
    const formData = new FormData()
    formData.append('serviceId', this.addSubServiceForm.value.serviceId);
    if(this.subServiceId){
      formData.append('subServiceId',this.subServiceId.toString())
    }
    formData.append('subServiceName', this.addSubServiceForm.value.subServiceName);
    formData.append('price', this.addSubServiceForm.value.price);
    formData.append('description', this.addSubServiceForm.value.description);
    formData.append('status', this.addSubServiceForm.value.status);
    if (this.file) {
        formData.append('image', this.file);
      }
    const { serviceId } = this.addSubServiceForm.value.serviceId;
    console.log('Form Values:', this.addSubServiceForm.value);
    console.log('Form Validity:', this.addSubServiceForm.valid);
    const request$ = this.mode === 'edit' && this.subServiceId
      ? this._adminService.updateSubService(this.subServiceId, formData)
      : this._adminService.createSubService(serviceId, formData);

    request$.subscribe({
      next: () => {
        this.addSubServiceForm.reset({ status: 'active' });
        this.file = null;
        
        this.isSubmitting = false;
        this._router.navigate(['/sub-service-management'])
        // TODO: Show success toast, e.g., this.mode === 'edit' ? "Sub-service updated" : "Sub-service created"
      },
      error: (error) => {
        console.error('Error:', error);
        this.isSubmitting = false;
        // TODO: Show error toast, e.g., "Failed to create/update sub-service"
      },
    });
  } else {
    this.addSubServiceForm.markAllAsTouched();
  }
}

}
