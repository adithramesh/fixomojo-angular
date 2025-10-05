import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { selectUserRole } from '../../../store/auth/auth.reducer';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent { 
  private _router = inject(Router)
  private _store=inject(Store)
  private _role=''
  
  constructor() {
    // No search logic needed—redirects only
  }

  ngOnInit(){
    this._store.select(selectUserRole).subscribe(role => {
                      if (role) {
                        this._role = role;
                      }
                    });
  }

  goToLogin() {
    this._router.navigate(['/login']);
  }

  goToHome() {

    switch (this._role) {
              case 'user':
                this._router.navigate(['/home']);
                break;
              case 'partner':
                this._router.navigate(['/partner-dashboard']);
                break;
              case 'admin':
                this._router.navigate(['/admin-dashboard']);
                break;
              default:
                this._router.navigate(['/signup']);
    
  }
}
}