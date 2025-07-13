// src/app/services/image-url.service.ts
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ImageUrlService {

  private cloudinaryBaseUrl = `https://res.cloudinary.com/${environment.CLOUDINARY_CLOUD_NAME}/image/upload/`;

  constructor() { }

  /**
   * Constructs a Cloudinary image URL from a public ID.
   * @param publicId The public ID of the image (e.g., 'services/my_image.jpg').
   * @param transformations Optional Cloudinary transformations (e.g., 'w_200,h_200,c_fill').
   * @returns The full Cloudinary URL or a placeholder if publicId is null/empty.
   */
  buildImageUrl(publicId: string | null | undefined, transformations: string = ''): string {
    if (!publicId) {
      return 'assets/placeholder.png'; // Or any default placeholder image
    }
    // Remove leading slash if it exists, as publicId from Cloudinary usually doesn't have it
    const cleanPublicId = publicId.startsWith('/') ? publicId.substring(1) : publicId;
    
    // Construct the URL without the version number, as Cloudinary handles it
    if (transformations) {
      return `${this.cloudinaryBaseUrl}${transformations}/${cleanPublicId}`;
    } else {
      return `${this.cloudinaryBaseUrl}${cleanPublicId}`;
    }
  }
}