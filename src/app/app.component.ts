import { Component } from '@angular/core';
import { NavigationStart, Router, RouterOutlet } from '@angular/router';
import { FloatingChatComponent } from './components/shared/floating-chat/floating-chat.component';
import { NotificationSocketService } from './services/notification-socket.service';
import { Store } from '@ngrx/store';
import { selectIsLoggedIn, selectTempUserId } from './store/auth/auth.reducer';
import { distinctUntilChanged, filter, Subscription } from 'rxjs';


@Component({
    selector: 'app-root',
    imports: [RouterOutlet, FloatingChatComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'front-end';

  //   userId: string | null = null;
  // private subscriptions: Subscription = new Subscription();
  // private maxReconnectAttempts = 3;
  // private reconnectAttempts = 0;
  // private reconnectDelay = 5000; // 5 seconds

  // constructor(
  //   private router: Router,
  //   private store: Store,
  //   private notificationSocketService: NotificationSocketService
  // ) {}

  // ngOnInit() {
  //   // Watch for navigation events (optional, keep for debugging)
  //   this.subscriptions.add(
  //     this.router.events.subscribe(event => {
  //       if (event instanceof NavigationStart) {
  //         console.log('Navigating to:', event.url);
  //       }
  //     })
  //   );

  //   // Watch for userId changes from store
  //   this.subscriptions.add(
  //     this.store.select(selectTempUserId).subscribe(userId => {
  //       if (userId && userId !== this.userId) {
  //         this.userId = userId;
  //         this.notificationSocketService.disconnect(); // Disconnect old socket if user changes
  //         this.connectSocket();
  //       }
  //     })
  //   );

  //   // Monitor socket connection status for reconnection
  //   this.subscriptions.add(
  //     this.notificationSocketService.getConnectionStatus().subscribe(isConnected => {
  //       if (!isConnected && this.userId && this.reconnectAttempts < this.maxReconnectAttempts) {
  //         console.warn('Socket disconnected, attempting to reconnect... Attempt:', this.reconnectAttempts + 1);
  //         setTimeout(() => {
  //           this.reconnectAttempts++;
  //           this.connectSocket();
  //         }, this.reconnectDelay);
  //       } else if (isConnected) {
  //         console.log('Socket successfully connected!');
  //         this.reconnectAttempts = 0; // Reset on successful connection
  //       } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
  //         console.error('Max reconnection attempts reached. Please check network or server.');
  //       }
  //     })
  //   );
  // }

  // ngOnDestroy() {
  //   this.subscriptions.unsubscribe();
  //   this.notificationSocketService.disconnect();
  // }

  // private connectSocket(): void {
  //   const token = localStorage.getItem('access_token');
  //   if (!token) {
  //     console.error('Cannot connect socket: No access token found in localStorage');
  //     return;
  //   }
  //   if (!this.userId) {
  //     console.error('Cannot connect socket: No userId available');
  //     return;
  //   }
  //   console.log('Connecting socket with token and userId:', token, this.userId);
  //   this.notificationSocketService.connect(token, this.userId);
  // }
    private subscriptions: Subscription = new Subscription();

  constructor(private router: Router) {}

  ngOnInit() {
    // Watch for navigation events for debugging
    this.subscriptions.add(
      this.router.events.subscribe(event => {
        if (event instanceof NavigationStart) {
          console.log('Navigating to:', event.url);
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}


// import { Component, inject, OnInit, OnDestroy } from '@angular/core';
// import { Store } from '@ngrx/store';
// import {selectUser, selectTempUserId, selectIsLoggedIn, selectUsername } from './store/auth/auth.reducer';
// import { Subscription } from 'rxjs';
// import { distinctUntilChanged, filter } from 'rxjs/operators';
// import { Router, NavigationStart, RouterOutlet } from '@angular/router';
// import { selectUserRole } from './store/auth/auth.reducer';
// import { NotificationSocketService } from './services/notification-socket.service';
// import { FloatingChatComponent } from './components/shared/floating-chat/floating-chat.component';

// @Component({
//   selector: 'app-root',
//   imports: [RouterOutlet, FloatingChatComponent],
//   templateUrl: './app.component.html',
//   styleUrl: './app.component.scss'
// })
// export class AppComponent implements OnInit, OnDestroy {
//   title = 'tech-connect';
  
//   // Dependency injection
//   private store = inject(Store);
//   private router = inject(Router);
//   private notificationSocketService = inject(NotificationSocketService);

//   private subscriptions = new Subscription();
//   private userId: string | null = null;
//   private userRole: string | null = null;

//   ngOnInit(): void {
//     console.log('🏁 AppComponent: Initializing...');

//     // Subscribe to the login status
//     this.subscriptions.add(
//       this.store.select(selectIsLoggedIn).pipe(
//         // Use distinctUntilChanged to only run the logic when the value changes (true -> false or false -> true)
//         distinctUntilChanged()
//       ).subscribe(isLoggedIn => {
//         console.log(`✅ Auth State Change: User is now logged in? ${isLoggedIn}`);
//         if (isLoggedIn) {
//           // If the user logs in, get the user ID and connect the socket
//           this.subscriptions.add(
//             this.store.select(selectTempUserId).subscribe(userId => {
//               this.userId = userId;
//               this.connectNotificationSocket();
//             })
//           );
//           // Get the user's role
//           this.subscriptions.add(
//             this.store.select(selectUserRole).subscribe(role => {
//               this.userRole = role;
//             })
//           );
//         } else {
//           // If the user logs out, disconnect the socket and reset the user ID
//           console.log('⚡️ Auth State Change: User has logged out. Disconnecting socket...');
//           this.userId = null;
//           this.userRole = null;
//           this.notificationSocketService.disconnect();
//         }
//       })
//     );
//   }

//   /**
//    * Attempts to connect the notification socket.
//    * This method should only be called after a successful login.
//    */
//   private connectNotificationSocket(): void {
//     console.log('🔌 Attempting to connect notification socket...');

//     const token = localStorage.getItem('access_token');
    
//     // Check if both the token and userId are available
//     if (token && this.userId) {
//       console.log('✅ Found access token and userId. Connecting socket...');
//       this.notificationSocketService.connect(token, this.userId);
//     } else {
//       console.log('❌ Cannot connect socket: Missing access token or user ID.');
//     }
//   }

//   ngOnDestroy(): void {
//     console.log('🧹 AppComponent: Cleaning up subscriptions and disconnecting socket...');
//     this.subscriptions.unsubscribe();
//     this.notificationSocketService.disconnect();
//   }
// }
