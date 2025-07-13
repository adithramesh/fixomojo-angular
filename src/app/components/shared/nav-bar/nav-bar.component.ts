// import { Component, inject } from '@angular/core';
// import { Router } from '@angular/router';
// import { Store } from '@ngrx/store';
// import { selectUsername, selectUserRole } from '../../../store/auth/auth.reducer';
// import { CommonModule } from '@angular/common';
// import { MatIconModule } from '@angular/material/icon';
// import { MatMenuModule } from '@angular/material/menu';

// @Component({
//   selector: 'app-nav-bar',
//   imports: [CommonModule, MatIconModule, MatMenuModule,],
//   templateUrl: './nav-bar.component.html',
//   styleUrl: './nav-bar.component.scss'
// })
// export class NavBarComponent {
//   private _router = inject(Router)
//   private _store = inject(Store)

//   username$=this._store.select(selectUsername)
//   role!:string;
//   dropdownOpen = false;

//   ngOnInit():void{
//      this._store.select(selectUserRole).subscribe(role => {
//                 if (role) {
//                   this.role = role;
//                 }
//               });
//   }

//   logout(){
//     localStorage.removeItem('access_token'); 
//     localStorage.removeItem('refresh_token'); 
//     this._router.navigate(['/login']); 
//     console.log('User logged out successfully'); 
//   }

//   navigateToAccount() {
//     this._router.navigate(['/my-bookings']); 
//   }

//   navigateToHome() {
//     if(this.role==='user'){
//       this._router.navigate(['/home']);
//     }else if(this.role==='partner'){
//       this._router.navigate(['/partner-dashboard']);
//     }else{
//       this._router.navigate(['/admin-dashboard']);
//     }
//   }


// }

import { Component, inject, OnInit, HostListener } from '@angular/core'; // Added HostListener
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectUsername, selectUserRole } from '../../../store/auth/auth.reducer';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [CommonModule, MatIconModule], // Removed MatIconModule, MatMenuModule
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss'
})
export class NavBarComponent implements OnInit {
  private _router = inject(Router);
  private _store = inject(Store);

  username$ = this._store.select(selectUsername);
  role!: string;
  dropdownOpen = false; // Re-introduced dropdown state

  ngOnInit(): void {
    this._store.select(selectUserRole).subscribe(role => {
      if (role) {
        this.role = role;
      }
    });
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this._router.navigate(['/login']);
    console.log('User logged out successfully');
  }

  navigateToMyProfile():void {
    if (this.role === 'partner') {
      this._router.navigate(['/my-profile']);
      this.dropdownOpen = false; // Close dropdown after navigation
    }
  }

  navigateToMyBookings(): void {
    if (this.role === 'user') {
      this._router.navigate(['/my-bookings']);
      this.dropdownOpen = false; // Close dropdown after navigation
    }
  }

  navigateToWallet(): void {
    if (this.role === 'partner') {
      this._router.navigate(['/partner-wallet']);
    } else if(this.role === 'admin') {
      this._router.navigate(['/admin-wallet']);
    } else{
      this._router.navigate(['/user-wallet']);
    }
    this.dropdownOpen = false; 
  }

  navigateToHome(): void {
    if (this.role === 'user') {
      this._router.navigate(['/home']);
    } else if (this.role === 'partner') {
      this._router.navigate(['/partner-dashboard']);
    } else {
      this._router.navigate(['/admin-dashboard']);
    }
    this.dropdownOpen = false; // Close dropdown after navigation
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  // Closes the dropdown when a click occurs outside of the dropdown trigger or content
  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    const target = event.target as HTMLElement;
    const isInsideDropdown = target.closest('.user-menu-trigger') || target.closest('.user-menu-dropdown');

    if (!isInsideDropdown && this.dropdownOpen) {
      this.dropdownOpen = false;
    }
  }
}

