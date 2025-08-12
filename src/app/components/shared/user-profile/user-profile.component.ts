// user-profile.component.ts
import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { SidebarComponent } from '../../admin/side-bar/side-bar.component';
import { PartnerSideBarComponent } from '../../partner/partner-side-bar/partner-side-bar.component';
import { selectUserRole } from '../../../store/auth/auth.reducer';
// import { ToastrService } from 'ngx-toastr';

registerPlugin(FilePondPluginImagePreview, FilePondPluginImageResize, FilePondPluginImageTransform);

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
  selectedFile: File | null = null;
  imagePreviewUrl: string = '';
  pondFiles: any[] = [];
  show = true;
  role: 'user' | 'partner' | 'admin' = 'user';

  private _fb = inject(FormBuilder);
  private _store = inject(Store<{ tempUserId: string }>);
  private _http = inject(HttpClient);
  private _imageUrlService = inject(ImageUrlService);
  private _router = inject(Router)
  private route= inject(ActivatedRoute)
  // private _toastr = inject(ToastrService);

  pondOptions = {
    allowMultiple: false,
    acceptedFileTypes: ['image/*'],
    allowImagePreview: false,
    labelIdle: 'Drag & Drop your profile image or <span class="filepond--label-action">Browse</span>',
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
      username: ['', [Validators.required, Validators.minLength(3)]]
    });

    this._store.select('tempUserId').subscribe(id => {
      this.userId = id;
      this.loadUserProfile();
    });
  }

  loadUserProfile(): void {
    this._http.get<any>(`${environment.BACK_END_API_URL}/user/get-profile`).subscribe({
      next: (profile) => {
        this.profileForm.patchValue({ username: profile.username });
        if (profile.profilePic) {
          const fullImageUrl = this._imageUrlService.buildImageUrl(profile.profilePic);
          this.imagePreviewUrl = fullImageUrl;
          this.pondFiles = [{
            source: fullImageUrl,
            options: { type: 'remote' },
            metadata: { poster: fullImageUrl }
          }];
        }
      },
      error: (err) => {
        console.error('Error fetching profile:', err);
        // this._toastr.error('Failed to load profile');
      }
    });
  }

  pondHandleAddFile(event: any): void {
    const file = event.file?.file;
    if (file) {
      this.selectedFile = file;
      this.imagePreviewUrl = URL.createObjectURL(file); // Preview selected file
    }
  }

  pondHandleRemoveFile(): void {
    this.selectedFile = null;
    this.loadUserProfile(); // Restore original image
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formData = new FormData();
    formData.append('username', this.profileForm.get('username')?.value);
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this._http.put(`${environment.BACK_END_API_URL}/user/update-profile`, formData).subscribe({
      next: () => {
        this.isSubmitting = false;
        // this._toastr.success('Profile updated successfully');
      
        this.loadUserProfile(); // Refresh data
      },
      error: (err) => {
        console.error('Error updating profile:', err);
        this.isSubmitting = false;
        // this._toastr.error('Failed to update profile');
      }
    });
  }

  cancel(): void {
     this._router.navigate(['/home'])
  }
}
