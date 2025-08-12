import { Component, inject, OnInit, HostListener } from '@angular/core'; // Added HostListener
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectUsername, selectUserRole } from '../../../store/auth/auth.reducer';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { INotification, NotificationService, PaginationRequestDTO } from '../../../services/notification.service';
import { NotificationSocketService } from '../../../services/notification-socket.service';
import { Subscription } from 'rxjs';

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
  private _notificationService = inject(NotificationService);
  private _notificationSocketService = inject(NotificationSocketService);

  username$ = this._store.select(selectUsername);
  userId!: string;
  role!: string;
  userDropdownOpen = false; // Re-introduced dropdown state
  notificationDropdownOpen = false;

  unreadNotificationCount: number = 0;
  notifications: INotification[] = []

  private subscriptions: Subscription = new Subscription();

  ngOnInit(): void {
    this._store.select(selectUserRole).subscribe(role => {
      if (role) {
        this.role = role;
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe(); // Unsubscribe from all RxJS subscriptions
    this._notificationSocketService.disconnect(); // Disconnect the global notification socket
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this._notificationSocketService.disconnect();
    this._router.navigate(['/login']);
    console.log('User logged out successfully');
  }

  navigateToMyProfile():void {
    if (this.role === 'partner' || this.role === 'user') {
      this._router.navigate(['/my-profile']);
      // this.dropdownOpen = false; // Close dropdown after navigation
      this.userDropdownOpen = false;
    }
  }

  navigateToMyBookings(): void {
    if (this.role === 'user') {
      this._router.navigate(['/my-bookings']);
      // this.dropdownOpen = false; // Close dropdown after navigation
      this.userDropdownOpen = false;
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
    // this.dropdownOpen = false; 
    this.userDropdownOpen = false;
  }

  navigateToHome(): void {
    if (this.role === 'user') {
      this._router.navigate(['/home']);
    } else if (this.role === 'partner') {
      this._router.navigate(['/partner-dashboard']);
    } else {
      this._router.navigate(['/admin-dashboard']);
    }
    // this.dropdownOpen = false; // Close dropdown after navigation
    this.userDropdownOpen = false;
  }

  toggleUserDropdown(): void {
    // this.dropdownOpen = !this.dropdownOpen;
    this.userDropdownOpen = !this.userDropdownOpen;
    this.notificationDropdownOpen = false;
  }

 toggleNotificationDropdown(): void {
    this.notificationDropdownOpen = !this.notificationDropdownOpen;
    this.userDropdownOpen = false; // Close user dropdown if notification dropdown opens

    if (this.notificationDropdownOpen) {
      // When opening, refetch notifications to get the latest state and apply read status
      this.getNotifications(1, 10); // Get latest 10 notifications (could be unread/read mix)
      // Automatically mark all currently displayed unread notifications as read when the dropdown is opened
      this.markAllNotificationsAsRead();
    }
  }

  getUnreadCount(): void {
    this.subscriptions.add(
      this._notificationService.getUnreadCount().subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.unreadNotificationCount = response.data.count;
          }
        },
        error: (err) => console.error('Error fetching unread count:', err)
      })
    );
  }

  getNotifications(page: number, pageSize: number, filter?: any): void {
    const pagination: PaginationRequestDTO = { page, pageSize, sortBy: 'createdAt', sortOrder: 'desc', filter };
    this.subscriptions.add(
      this._notificationService.getNotifications(pagination).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.notifications = response.data.items; // Assuming response.data.items is the array of notifications
          }
        },
        error: (err) => console.error('Error fetching notifications:', err)
      })
    );
  }

  markAsRead(notification: INotification): void {
    console.log("inside mark as read");
    
    if (!notification.read) { // Only call API if it's currently unread
      this.subscriptions.add(
        this._notificationService.markAsRead(notification._id).subscribe({
          next: (response) => {
            if (response.success) {
              notification.read = true; // Update local state immediately
              this.unreadNotificationCount--; // Decrement local count
              // Ensure count doesn't go below zero
              if (this.unreadNotificationCount < 0) {
                this.unreadNotificationCount = 0;
              }
            }
          },
          error: (err) => console.error('Error marking notification as read:', err)
        })
      );
    }
  }
  markAllNotificationsAsRead(): void {
    console.log("this.unreadNotificationCount ", this.unreadNotificationCount );
    
    if (this.unreadNotificationCount > 0) { // Only call API if there are unread notifications
      this.subscriptions.add(
        this._notificationService.markAllAsRead().subscribe({
          next: (response) => {
            if (response.success) {
              this.notifications.forEach(notif => notif.read = true); // Mark all locally as read
              this.unreadNotificationCount = 0; // Set count to 0 instantly
            }
          },
          error: (err) => console.error('Error marking all notifications as read:', err)
        })
      );
    }
  }



  // Closes the dropdown when a click occurs outside of the dropdown trigger or content
  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    const target = event.target as HTMLElement;
    const isInsideDropdown = target.closest('.user-menu-trigger') || target.closest('.user-menu-dropdown');

    if (!isInsideDropdown && this.userDropdownOpen) {
      this.userDropdownOpen = false;
    }
  }
}

