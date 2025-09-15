import { Component, inject, OnInit, HostListener } from '@angular/core'; 
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectIsLoggedIn, selectTempUserId, selectUsername, selectUserRole } from '../../../store/auth/auth.reducer';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { INotification, NotificationService, PaginationRequestDTO } from '../../../services/notification.service';
import { NotificationSocketService } from '../../../services/notification-socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [CommonModule, MatIconModule],
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
  userDropdownOpen = false;
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

    this.subscriptions.add(
      this._store.select(selectIsLoggedIn).subscribe(isLoggedIn => {
        if (isLoggedIn) {
          this._store.select(selectTempUserId).subscribe(userId => {
            if (userId && userId !== this.userId) {
              this.userId = userId;
              this.connectSocket();
            }
          });
        } else {
          this._notificationSocketService.disconnect();
          this.userId = '';
        }
      })
    );

    this.subscriptions.add(
    this._notificationSocketService.onNewNotification().subscribe((notif) => {
      this.notifications.unshift(notif); 
      if (!notif.read) {
        this.unreadNotificationCount++;
      }
    })
  );
    this.getNotifications(1, 10)
    this.getUnreadCount();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe(); 
    this._notificationSocketService.disconnect(); 
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this._notificationSocketService.disconnect();
    this._router.navigate(['/login']);
  }

  navigateToMyProfile():void {
    if (this.role === 'partner' || this.role === 'user') {
      this._router.navigate(['/my-profile']);
      this.userDropdownOpen = false;
    }
  }

  navigateToMyBookings(): void {
    if (this.role === 'user') {
      this._router.navigate(['/my-bookings']);
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
    this.userDropdownOpen = false;
  }

  toggleUserDropdown(): void {
    this.userDropdownOpen = !this.userDropdownOpen;
    this.notificationDropdownOpen = false;
  }



   toggleNotificationDropdown(): void {
    this.notificationDropdownOpen = !this.notificationDropdownOpen;
    this.userDropdownOpen = false;
    if (this.notificationDropdownOpen) {
      this.getUnreadCount(); 
      this.getNotifications(1, 10);
      if (this.unreadNotificationCount > 0) {
        this.markAllNotificationsAsRead();
      }
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
            this.notifications = response.data.items; 
          }
        },
        error: (err) => console.error('Error fetching notifications:', err)
      })
    );
  }


markAsRead(notificationId: string, actionTaken?: string): void {
  this.subscriptions.add(
    this._notificationService.markAsRead(notificationId, actionTaken).subscribe({
      next: (response) => {
        if (response.success) {
          const index = this.notifications.findIndex(n => n._id === notificationId);
          if (index !== -1) {
            this.notifications[index].read = true;
            if (actionTaken) {
              this.notifications[index].actionTaken = actionTaken;
            }
            this.unreadNotificationCount--;
            if (this.unreadNotificationCount < 0) {
              this.unreadNotificationCount = 0;
            }
          }
        }
      },
      error: (err) => console.error('Error marking notification as read:', err)
    })
  );
}
  markAllNotificationsAsRead(): void {    
    if (this.unreadNotificationCount > 0) { 
      this.subscriptions.add(
        this._notificationService.markAllAsRead().subscribe({
          next: (response) => {
            if (response.success) {
              this.notifications.forEach(notif => notif.read = true); 
              this.unreadNotificationCount = 0; 
            }
          },
          error: (err) => console.error('Error marking all notifications as read:', err)
        })
      );
    }
  }


  acceptCallFromNavbar(notification: INotification): void {
    if (notification.payload && notification.payload.callId) {
      const callId = notification.payload.callId;
      this.markAsRead(notification._id, 'accepted'); 
      this._router.navigate(['/video-call/join', callId]);
      this.notificationDropdownOpen = false; 
    }
  }

    declineCallFromNavbar(notification: INotification): void {
      this.markAsRead(notification._id, 'declined'); 
      this.notificationDropdownOpen = false; 
    }

    private connectSocket(): void {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.error('Cannot connect socket: No access token found in localStorage');
      return;
    }
    if (!this.userId) {
      console.error('Cannot connect socket: No userId available');
      return;
    }
    console.log('Connecting socket with token and userId:', token, this.userId);
    this._notificationSocketService.connect(token, this.userId);
    this.subscriptions.add(
      this._notificationSocketService.getConnectionStatus().subscribe(isConnected => {
        if (isConnected) {
          console.log('Socket successfully connected!');
        } else {
          console.warn('Socket disconnected, check token or server');
        }
      })
    );
  }

  
  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    const target = event.target as HTMLElement;
    const isInsideDropdown = target.closest('.user-menu-trigger') || target.closest('.user-menu-dropdown');

    if (!isInsideDropdown && this.userDropdownOpen) {
      this.userDropdownOpen = false;
    }
  }


}




