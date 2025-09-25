// import { Component, inject, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators, ReactiveFormsModule} from '@angular/forms';
// import { CommonModule } from '@angular/common';
// import { ActivatedRoute, Router } from '@angular/router';
// import { AdminService } from '../../../services/admin.service';
// import { ServiceResponseDTO } from '../../../models/admin.model';
// import { FilePondModule, registerPlugin } from 'ngx-filepond';
// import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
// import FilePondPluginImageResize from 'filepond-plugin-image-resize';
// import FilePondPluginImageTransform from 'filepond-plugin-image-transform';
// import { ImageUrlService } from '../../../services/image.service';
// import { NavBarComponent } from '../../shared/nav-bar/nav-bar.component';
// import { SidebarComponent } from '../side-bar/side-bar.component';
// import { FilePondFile, FilePondInitialFile } from 'filepond';


// registerPlugin(FilePondPluginImagePreview, FilePondPluginImageResize, FilePondPluginImageTransform);

// @Component({
//   selector: 'app-add-service',
//   standalone: true,
//   imports: [ReactiveFormsModule, CommonModule, FilePondModule, NavBarComponent, SidebarComponent],
//   templateUrl: './add-service.component.html',
//   styleUrl: './add-service.component.scss'
// })
// export class AddServiceComponent implements OnInit {
//   addServiceForm!: FormGroup;
//   file: File | null = null;
//   pondFiles: FilePondInitialFile[] = [];

//   private _fb = inject(FormBuilder);
//   private _adminService = inject(AdminService);
//   private _route = inject(ActivatedRoute);
//   private _router = inject(Router);
//   public _imageUrlService = inject(ImageUrlService)

//   isSubmitting = false;
//   mode: 'add' | 'edit' = 'add';
//   serviceId: string | null = null;

//   pondOptions = {
//     allowMultiple: false,
//     allowImagePreview: true,
//     allowReplace: true,
//     acceptedFileTypes: ['image/*'],
//     labelIdle: 'Click to upload or drag and drop<br><span class="filepond--label-action">Browse</span>',
//     imageResizeTargetWidth: 300,
//     imageResizeTargetHeight: 200,
//     imageResizeMode: 'cover'
//   };

//   ngOnInit(): void {
//     this.serviceId = this._route.snapshot.paramMap.get('id');
//     this.mode = this.serviceId ? 'edit' : 'add';

//     this.addServiceForm = this._fb.group({
//       serviceName: ['', Validators.required],
//       description: ['', Validators.required]
//     });

//     if (this.mode === 'edit' && this.serviceId) {
//       this.loadServiceData(this.serviceId);
//     }
//   }

//   loadServiceData(serviceId: string): void {
//     this._adminService.getServiceById(serviceId).subscribe({
//       next: (service: ServiceResponseDTO) => {
//         this.addServiceForm.patchValue({
//           serviceName: service.serviceName || '',
//           description: service.description || '',
          
//         });

//         if (service.image) {
//           const fullImageUrl = this._imageUrlService.buildImageUrl(service.image);
//           this.pondFiles = [{
//             source: fullImageUrl,
            
//             options: {
//               type: 'local' ,
//               // size: 500000
//             },
//             //  metadata: {
//             //   poster: fullImageUrl 
//             // }
//           }];
//         }
//       }
//     });
//   }

//   // pondHandleAddFile(event: any): void {
//   //   console.log("pondHandleAddFile", event),event.file;
//   //   this.file = event.file?.file || null;
//   // }


//   // pondHandleAddFile(event: { file: File }): void { 
//   //   this.file = event.file || null;
//   // }

//   // pondHandleRemoveFile(): void {
//   //   console.log("pondHandleRemoveFile, file",this.file );
//   //   this.file = null;
//   // }

//   // pondHandleRemoveFile(event: FilePondFile): void {
//   //     console.log("pondHandleRemoveFile", event.file);
//   //     this.file = null;
//   //   }

//   pondHandleAddFile(event: FilePondFile): void {
//   this.file = event.file as File;   
// }

//     pondHandleRemoveFile(): void {
//       this.file = null;
//     }

//   onSubmit(): void {
//     console.log("inside onsubmit");
    
//     if (this.addServiceForm.valid) {
//       this.isSubmitting = true;
//       const formData = new FormData();

//       formData.append('serviceName', this.addServiceForm.value.serviceName);
//       formData.append('description', this.addServiceForm.value.description);

//       if (this.file) {
//         formData.append('image', this.file);
//       }

//       const request$ = this.mode === 'edit' && this.serviceId
//         ? this._adminService.updateService(this.serviceId, formData)
//         : this._adminService.createService(formData);

//         const isEditMode = this.mode === 'edit';

//       request$.subscribe({
//         next: () => {
//           console.log('Operation:', isEditMode ? 'Edit' : 'Add');
//           this.addServiceForm.reset();
//           this.file = null;
//           this.isSubmitting = false;
//           this._router.navigate(['/service-management']);
//         },
//         error: (error) => {
//           console.error('Error submitting form:', error);
//           this.isSubmitting = false;
//         }
//       });
//     } else {
//       Object.values(this.addServiceForm.controls).forEach(control => control.markAsTouched());
//     }
//   }
// }


import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../../services/admin.service';
import { ServiceResponseDTO } from '../../../models/admin.model';
import { FilePondModule, registerPlugin } from 'ngx-filepond';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import FilePondPluginImageResize from 'filepond-plugin-image-resize';
import FilePondPluginImageTransform from 'filepond-plugin-image-transform';
import { ImageUrlService } from '../../../services/image.service';
import { NavBarComponent } from '../../shared/nav-bar/nav-bar.component';
import { SidebarComponent } from '../side-bar/side-bar.component';
import { FilePondErrorDescription, FilePondFile, FilePondInitialFile } from 'filepond';

registerPlugin(FilePondPluginImagePreview, FilePondPluginImageResize, FilePondPluginImageTransform);

@Component({
  selector: 'app-add-service',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FilePondModule, NavBarComponent, SidebarComponent],
  templateUrl: './add-service.component.html',
  styleUrl: './add-service.component.scss',
})
export class AddServiceComponent implements OnInit {
  addServiceForm!: FormGroup;
  file: File | null = null;
  pondFiles: FilePondInitialFile[] = [];

  private _fb = inject(FormBuilder);
  private _adminService = inject(AdminService);
  private _route = inject(ActivatedRoute);
  private _router = inject(Router);
  public _imageUrlService = inject(ImageUrlService);

  isSubmitting = false;
  mode: 'add' | 'edit' = 'add';
  serviceId: string | null = null;

  pondOptions = {
    allowMultiple: false,
    allowImagePreview: true,
    allowReplace: true,
    acceptedFileTypes: ['image/*'],
    labelIdle: 'Click to upload or drag and drop<br><span class="filepond--label-action">Browse</span>',
    imageResizeTargetWidth: 300,
    imageResizeTargetHeight: 200,
    imageResizeMode: 'cover',
  };

  ngOnInit(): void {
    this.serviceId = this._route.snapshot.paramMap.get('id');
    this.mode = this.serviceId ? 'edit' : 'add';

    this.addServiceForm = this._fb.group({
      serviceName: ['', Validators.required],
      description: ['', Validators.required],
    });

    if (this.mode === 'edit' && this.serviceId) {
      this.loadServiceData(this.serviceId);
    }
  }

  loadServiceData(serviceId: string): void {
    this._adminService.getServiceById(serviceId).subscribe({
      next: (service: ServiceResponseDTO) => {
        this.addServiceForm.patchValue({
          serviceName: service.serviceName || '',
          description: service.description || '',
        });

        if (service.image) {
          // const fullImageUrl = this._imageUrlService.buildImageUrl(service.image);
          // this.pondFiles = [{
          //   source: fullImageUrl,
          //   options: {
          //     type: 'local' as const,
          //   },
          // }];
          this.pondFiles = [];

          //  const filename = service.image.split('/').pop() || service.image;
          //   this.pondFiles = [{
          //     source: filename,
          //     options: {
          //       type: 'local' as const,
          //     },
          //   }];
        }
      },
      error: (error) => {
        console.error('Error loading service:', error);
      },
    });
  }

  pondHandleAddFile(error: FilePondErrorDescription | null, file: FilePondFile): void {
  if (error) {
    console.error('FilePond add file error:', error);
    return;
  }
  this.file = file.file as File;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
pondHandleRemoveFile(error: FilePondErrorDescription | null, file: FilePondFile): void {
  if (error) {
    console.error('FilePond remove file error:', error);
    return;
  }
  this.file = null;
}

  onSubmit(): void {
    if (this.addServiceForm.valid) {
      this.isSubmitting = true;
      const formData = new FormData();
      formData.append('serviceName', this.addServiceForm.value.serviceName);
      formData.append('description', this.addServiceForm.value.description);

      if (this.file) {
        formData.append('image', this.file);
      }

      const request$ = this.mode === 'edit' && this.serviceId
        ? this._adminService.updateService(this.serviceId, formData)
        : this._adminService.createService(formData);

      request$.subscribe({
        next: () => {
          console.log(`${this.mode === 'edit' ? 'Updated' : 'Created'} service successfully`);
          this.addServiceForm.reset();
          this.file = null;
          this.pondFiles = [];
          this.isSubmitting = false;
          this._router.navigate(['/service-management']);
        },
        error: (error) => {
          console.error('Error submitting form:', error);
          this.isSubmitting = false;
        },
      });
    } else {
      Object.values(this.addServiceForm.controls).forEach(control => control.markAsTouched());
    }
  }
}