// src/app/services/image-url.service.ts
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ImageUrlService {

  private cloudinaryBaseUrl = `https://res.cloudinary.com/${environment.CLOUDINARY_CLOUD_NAME}/image/upload/`;

  constructor() { }

  buildImageUrl(publicId: string | null | undefined, transformations: string = ''): string {
    if (!publicId) {
      return 'assets/placeholder.png'; // Or any default placeholder image
    }
    const cleanPublicId = publicId.startsWith('/') ? publicId.substring(1) : publicId;
    if (transformations) {
      return `${this.cloudinaryBaseUrl}${transformations}/${cleanPublicId}`;
    } else {
      return `${this.cloudinaryBaseUrl}${cleanPublicId}`;
    }
  }
}