import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './unauthorized.component.html',
  styleUrls: ['./unauthorized.component.scss']
})
export class UnauthorizedComponent {
 
  private _router = inject(Router)

  goToSignup() {
    this._router.navigate(['/signup']);
  }

  goToLogin() {
    this._router.navigate(['/login']); 
  }
}