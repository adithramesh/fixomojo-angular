// src/app/core/services/notification-socket.service.ts

import { Injectable } from "@angular/core";
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment } from "../../environments/environment";
import { INotification } from "./notification.service";


// Define a simple interface for chat notification data for a toast/summary
export interface ChatNotificationData {
  bookingId: string;
  senderId: string;
  message: string;
  senderType: 'user' | 'technician';
  // Add any other fields useful for a notification pop-up
}

@Injectable({ providedIn: 'root' })
export class NotificationSocketService { // Renamed from SocketService
  private socket: Socket | null = null;
  private isConnected = false;
  private apiUrl = `${environment.BACK_END_API_URL}`;

  // Subject to track connection status (BehaviorSubject for initial state)
  private connectionStatus$ = new BehaviorSubject<boolean>(false);
  // Subject for new general notifications (e.g., booking updates, system alerts)
  private newNotificationSubject = new Subject<INotification>();
  // Subject for new chat message notifications (for toasts/summary, not full chat)
  private newChatNotificationSubject = new Subject<ChatNotificationData>();

  constructor() {}

  /**
   * Initializes the socket connection for general user-specific notifications.
   * Connects with the user's ID to join their personal notification room.
   * @param token Auth token for authentication.
   * @param userId The ID of the currently logged-in user.
   */
  connect(token: string, userId: string): void {
    // Only connect if not already connected
    if (this.isConnected && this.socket && (this.socket.io.opts.query as any)?.userId === userId) {
      console.log('Notification Socket already connected for this user.');
      return;
    }
    // If connected for a different user or not connected, ensure clean slate
    if (this.socket) {
      this.disconnect();
    }

    this.socket = io(this.apiUrl, {
      auth: {
        token: `Bearer ${token}`
      },
      query: {
        userId: userId // Essential: Pass userId for backend to join user-specific room
      },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Notification Socket connected:', this.socket?.id);
      this.isConnected = true;
      this.connectionStatus$.next(true);
      this.setupListeners(); // Setup listeners after connection
    });

    this.socket.on('disconnect', () => {
      console.log('Notification Socket disconnected');
      this.isConnected = false;
      this.connectionStatus$.next(false);
      // Ensure subjects are completed on disconnect for proper cleanup
      this.newNotificationSubject.complete();
      this.newChatNotificationSubject.complete();
    });

    this.socket.on('connect_error', (error) => {
      console.error('Notification Socket connection error:', error);
      this.isConnected = false;
      this.connectionStatus$.next(false);
    });

    this.socket.on('error', (error) => {
      console.error('Notification Socket error:', error);
    });
  }

  /**
   * Sets up the listeners for various notification events from the backend.
   */
  private setupListeners(): void {
    if (!this.socket) {
      console.error('Socket not connected, cannot set up listeners.');
      return;
    }

    // Listener for general system notifications (from backend 'newNotification' event)
    this.socket.on('newNotification', (notification: INotification) => {
      console.log('Received new general notification:', notification);
      this.newNotificationSubject.next(notification);
    });

    // Listener for chat message notifications (e.g., for toasts/pop-ups, from backend 'newChatMessage' event)
    // The backend should emit this when a new chat message arrives for a recipient not currently in the chat room
    this.socket.on('newChatMessage', (data: ChatNotificationData) => {
        console.log('Received new chat message notification:', data);
        this.newChatNotificationSubject.next(data);
    });

    // Add other specific notification event listeners here if needed (e.g., 'newAdminNotification')
    this.socket.on('newAdminNotification', (notification: INotification) => {
        console.log('Received new admin notification:', notification);
        this.newNotificationSubject.next(notification); // Or a separate subject if admin notifications need different UI
    });
  }

  /**
   * Provides an observable for components to subscribe to new general notifications.
   * @returns An Observable of INotification.
   */
  onNewNotification(): Observable<INotification> {
    return this.newNotificationSubject.asObservable();
  }

  /**
   * Provides an observable for components to subscribe to new chat message notifications (for toasts).
   * @returns An Observable of ChatNotificationData.
   */
  onNewChatNotification(): Observable<ChatNotificationData> {
      return this.newChatNotificationSubject.asObservable();
  }

  /**
   * Provides an observable for components to get the current socket connection status.
   * @returns An Observable of boolean indicating connection status.
   */
  getConnectionStatus(): Observable<boolean> {
    return this.connectionStatus$.asObservable();
  }

  /**
   * Disconnects the notification socket.
   */
  disconnect(): void {
    if (this.socket) {
      console.log('Disconnecting Notification Socket...');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.connectionStatus$.next(false);
      // Re-initialize subjects so new subscriptions after disconnect don't get stale data
      this.newNotificationSubject = new Subject<INotification>();
      this.newChatNotificationSubject = new Subject<ChatNotificationData>();
    }
  }

  /**
   * Checks if the notification socket is currently connected.
   * @returns True if connected, false otherwise.
   */
  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }
}