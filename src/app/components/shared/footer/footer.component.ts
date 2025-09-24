import { Component } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-footer',
    imports: [MatIconModule],
    templateUrl: './footer.component.html',
    styleUrl: './footer.component.scss'
})
export class FooterComponent {
  email = '';



  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
