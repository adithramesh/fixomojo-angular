// import { Component, inject, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
// import { FilePondModule, registerPlugin } from 'ngx-filepond';
// import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
// import FilePondPluginImageResize from 'filepond-plugin-image-resize';
// import FilePondPluginImageTransform from 'filepond-plugin-image-transform';
// import { CommonModule } from '@angular/common';
// import { ImageUrlService } from '../../../services/image.service';
// import { Store } from '@ngrx/store';
// import { HttpClient } from '@angular/common/http';
// import { environment } from '../../../../environments/environment';
// import { ActivatedRoute, Router } from '@angular/router';
// import { NavBarComponent } from '../nav-bar/nav-bar.component';
// import { PartnerSideBarComponent } from '../../partner/partner-side-bar/partner-side-bar.component';
// import { selectUserRole } from '../../../store/auth/auth.reducer';
// import { AuthActions } from '../../../store/auth/auth.actions';
// import { ActualFileObject, FilePondInitialFile } from 'filepond';
// import { UserResponseDTO } from '../../../models/admin.model';

// registerPlugin(FilePondPluginImagePreview, FilePondPluginImageResize, FilePondPluginImageTransform);

// // Custom validator to prevent leading/trailing whitespace
// function noWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
//   const value = control.value || '';
//   const hasLeadingOrTrailingWhitespace = value.trim() !== value;
//   return hasLeadingOrTrailingWhitespace ? { whitespace: true } : null;
// }

// // Custom validator for username to allow only alphanumeric and specific characters
// function usernameFormatValidator(control: AbstractControl): ValidationErrors | null {
//   const value = control.value || '';
//   const validFormat = /^[a-zA-Z0-9_-]+$/.test(value);
//   return !validFormat ? { invalidUsernameFormat: true } : null;
// }

// @Component({
//   selector: 'app-user-profile',
//   standalone: true,
//   imports: [CommonModule, ReactiveFormsModule, FilePondModule, NavBarComponent, PartnerSideBarComponent],
//   templateUrl: './user-profile.component.html',
//   styleUrl: './user-profile.component.scss'
// })
// export class UserProfileComponent implements OnInit {
//   profileForm!: FormGroup;
//   userId = '';
//   isSubmitting = false;
//   isLoading = false;
//   selectedFile: File | null = null;
//   imagePreviewUrl = '';
//   pondFiles: (string | FilePondInitialFile | Blob | ActualFileObject)[] = [];
//   show = true;
//   role: 'user' | 'partner' | 'admin' = 'user';

//   private _fb = inject(FormBuilder);
//   private _store = inject(Store);
//   private _http = inject(HttpClient);
//   private _imageUrlService = inject(ImageUrlService);
//   private _router = inject(Router);
//   private _route = inject(ActivatedRoute);
//   // private _toastr = inject(ToastrService);

//   pondOptions = {
//     allowMultiple: false,
//     acceptedFileTypes: ['image/*'],
//     allowImagePreview: false,
//     labelIdle: 'Drag & Drop your profile image or <span class="filepond--label-action">Browse</span>',
//     imageResizeTargetWidth: 100,
//     imageResizeTargetHeight: 100,
//     imageResizeMode: 'cover'
//   };

//   ngOnInit(): void {
//     this._store.select(selectUserRole).subscribe(role => {
//       if (role) {
//         this.role = role;
//       }
//     });

//     this.profileForm = this._fb.group({
//       username: ['', [
//         Validators.required,
//         Validators.minLength(3),
//         Validators.maxLength(50),
//         noWhitespaceValidator,
//         usernameFormatValidator
//       ]],
//       phoneNumber: ['', [
//         Validators.required,
//         // eslint-disable-next-line no-useless-escape
//         Validators.pattern(/^\+91[\- ]?[6-9]\d{9}$/),
//         noWhitespaceValidator
//       ]]
//     });

//     this._store.select('tempUserId').subscribe(id => {
//       this.userId = id;
//       this.loadUserProfile();
//     });
//   }

//   loadUserProfile(): void {
//     this.isLoading = true;
//     this._http.get<{username:string, phoneNumber:string, profilePic?:string}>(`${environment.BACK_END_API_URL}/user/get-profile`).subscribe({
//       next: (profile) => {
//         this.profileForm.patchValue({
//           username: profile.username,
//           phoneNumber: profile.phoneNumber
//         });
//         if (profile.profilePic) {
//           const fullImageUrl = this._imageUrlService.buildImageUrl(profile.profilePic);
//           this.imagePreviewUrl = fullImageUrl;
//           this.pondFiles = [
//           //   {
//           //   source: fullImageUrl,
//           //   options: { type: 'local' },
//           //   metadata: { poster: fullImageUrl }
//           // }
//         ];
//         }
//         this.isLoading = false;
//       },
//       error: (err) => {
//         console.error('Error fetching profile:', err);
//         // this._toastr.error('Failed to load profile. Please try again.', 'Error');
//         this.isLoading = false;
//       }
//     });
//   }

//   pondHandleAddFile(event:  { file: File }): void {
//     const file = event.file;
//     if (file) {
//       this.selectedFile = file;
//       this.imagePreviewUrl = URL.createObjectURL(file);
//     }
//   }

//   pondHandleRemoveFile(): void {
//     this.selectedFile = null;
//     this.loadUserProfile();
//   }

//   onSubmit(): void {
//     if (this.profileForm.invalid) {
//       this.profileForm.markAllAsTouched();
//       return;
//     }

//     this.isSubmitting = true;
//     const formData = new FormData();
//     formData.append('username', this.profileForm.get('username')?.value.trim());
//     formData.append('phoneNumber', this.profileForm.get('phoneNumber')?.value.trim());
//     if (this.selectedFile) {
//       formData.append('image', this.selectedFile);
//     }

//     this._http.put(`${environment.BACK_END_API_URL}/user/update-profile`, formData).subscribe({
//       next: (response:Partial<UserResponseDTO>) => {
//         this.isSubmitting = false;
//         this._store.dispatch(AuthActions.updateUsername({ username: response.username! }));
//         this.loadUserProfile();
//       },
//       error: (err) => {
//         console.error('Error updating profile:', err);
//         this.isSubmitting = false;
//       }
//     });
//   }

//   cancel(): void {
//     this._router.navigate(['/home']);
//   }
// }



import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { FilePondModule, registerPlugin } from 'ngx-filepond';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import FilePondPluginImageResize from 'filepond-plugin-image-resize';
import FilePondPluginImageTransform from 'filepond-plugin-image-transform';
import { CommonModule } from '@angular/common';
import { ImageUrlService } from '../../../services/image.service';
import { Store } from '@ngrx/store';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { PartnerSideBarComponent } from '../../partner/partner-side-bar/partner-side-bar.component';
import { selectUserRole } from '../../../store/auth/auth.reducer';
import { AuthActions } from '../../../store/auth/auth.actions';
import { FilePondInitialFile } from 'filepond';
import { UserResponseDTO } from '../../../models/admin.model';

registerPlugin(FilePondPluginImagePreview, FilePondPluginImageResize, FilePondPluginImageTransform);
// Custom validator to prevent leading/trailing whitespace
function noWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value || '';
  const hasLeadingOrTrailingWhitespace = value.trim() !== value;
  return hasLeadingOrTrailingWhitespace ? { whitespace: true } : null;
}
// Custom validator for username to allow only alphanumeric and specific characters
function usernameFormatValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value || '';
  const validFormat = /^[a-zA-Z0-9_-]+$/.test(value);
  return !validFormat ? { invalidUsernameFormat: true } : null;
}
@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FilePondModule, NavBarComponent, PartnerSideBarComponent],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent implements OnInit {
  profileForm!: FormGroup;
  userId = '';
  isSubmitting = false;
  isLoading = false;
  file: File | null = null;
  imagePreviewUrl = '';
  pondFiles: FilePondInitialFile[] = [];
  show = true;
  role: 'user' | 'partner' | 'admin' = 'user';
  private _fb = inject(FormBuilder);
  private _store = inject(Store);
  private _http = inject(HttpClient);
  private _imageUrlService = inject(ImageUrlService);
  private _router = inject(Router);
  private _route = inject(ActivatedRoute);
  // private _toastr = inject(ToastrService);
  pondOptions = {
    allowMultiple: false,
    acceptedFileTypes: ['image/*'],
    allowImagePreview: true,
    labelIdle: 'Click to upload or drag and drop<br><span class="filepond--label-action">Browse</span>',
    imageResizeTargetWidth: 100,
    imageResizeTargetHeight: 100,
    imageResizeMode: 'cover'
  };
  ngOnInit(): void {
    this._store.select(selectUserRole).subscribe(role => {
      if (role) {
        this.role = role;
      }
    });
    this.profileForm = this._fb.group({
      username: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
        noWhitespaceValidator,
        usernameFormatValidator
      ]],
      phoneNumber: ['', [
        Validators.required,
        // eslint-disable-next-line no-useless-escape
        Validators.pattern(/^\+91[\- ]?[6-9]\d{9}$/),
        noWhitespaceValidator
      ]]
    });
    this._store.select('tempUserId').subscribe(id => {
      this.userId = id;
      this.loadUserProfile();
    });
  }
  loadUserProfile(): void {
    this.isLoading = true;
    this._http.get<{username:string, phoneNumber:string, profilePic?:string}>(`${environment.BACK_END_API_URL}/user/get-profile`).subscribe({
      next: (profile) => {
        this.profileForm.patchValue({
          username: profile.username,
          phoneNumber: profile.phoneNumber
        });
        if (profile.profilePic) {
          // const fullImageUrl = this._imageUrlService.buildImageUrl(profile.profilePic);
          // this.pondFiles = [{
          // source: fullImageUrl,
          // options: { type: 'local' },
          // }];
          this.pondFiles = [];
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching profile:', err);
        // this._toastr.error('Failed to load profile. Please try again.', 'Error');
        this.isLoading = false;
      }
    });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pondHandleAddFile(event: any): void {
    const [error, file] = event;
    if (error) {
      console.error('FilePond add file error:', error);
      return;
    }
    this.file = file.file as File;
  }
  pondHandleRemoveFile(): void {
    this.file = null;
  }
  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    const formData = new FormData();
    formData.append('username', this.profileForm.get('username')?.value.trim());
    formData.append('phoneNumber', this.profileForm.get('phoneNumber')?.value.trim());
    if (this.file) {
      formData.append('image', this.file);
    }
    this._http.put(`${environment.BACK_END_API_URL}/user/update-profile`, formData).subscribe({
      next: (response:Partial<UserResponseDTO>) => {
        this.isSubmitting = false;
        this._store.dispatch(AuthActions.updateUsername({ username: response.username! }));
        this.loadUserProfile();
      },
      error: (err) => {
        console.error('Error updating profile:', err);
        this.isSubmitting = false;
      }
    });
  }
  cancel(): void {
    this._router.navigate(['/home']);
  }
}
