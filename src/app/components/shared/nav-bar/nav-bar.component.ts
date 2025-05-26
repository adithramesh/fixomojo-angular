import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectUsername } from '../../../store/auth/auth.reducer';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-nav-bar',
  imports: [CommonModule],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss'
})
export class NavBarComponent {
  private _router = inject(Router)
  store = inject(Store)

  username$=this.store.select(selectUsername)

  logout(){
    localStorage.removeItem('access_token'); 
    localStorage.removeItem('refresh_token'); 
    this._router.navigate(['/login']); 
    console.log('User logged out successfully'); 
  }
}


