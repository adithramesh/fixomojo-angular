import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
// import { NewsletterService } from '../services/newsletter.service';
@Component({
    selector: 'app-footer',
    imports: [],
    templateUrl: './footer.component.html',
    styleUrl: './footer.component.css'
})
export class FooterComponent {
  email: string = '';

  // constructor(private newsletterService: NewsletterService) {}

  // onSubscribe() {
  //   if (this.validateEmail(this.email)) {
  //     this.newsletterService.subscribeEmail(this.email)
  //       .subscribe({
  //         next: (response) => {
  //           // Success handling
  //           console.log('Subscription successful', response);
  //           // Optional: Show success message to user
  //           this.email = ''; // Clear input after successful subscription
  //         },
  //         error: (error) => {
  //           // Error handling
  //           console.error('Subscription failed', error);
  //           // Optional: Show error message to user
  //         }
  //       });
  //   } else {
  //     // Optional: Show validation error
  //     console.error('Invalid email address');
  //   }
  // }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
