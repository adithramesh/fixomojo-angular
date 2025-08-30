import { Injectable } from "@angular/core";
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment } from "../../environments/environment";
import { INotification } from "./notification.service";

//real-time

export interface ChatNotificationData {
  bookingId: string;
  senderId: string;
  message: string;
  senderType: 'user' | 'technician';
}

@Injectable({ providedIn: 'root' })
export class NotificationSocketService { 
  public socket: Socket | null = null;
  private isConnected = false;
  private apiUrl = `${environment.BACK_END_API_URL}`;

  
  private connectionStatus$ = new BehaviorSubject<boolean>(false);
  private newNotificationSubject = new Subject<INotification>();
  private newChatNotificationSubject = new Subject<ChatNotificationData>();
  private endCallSubject = new Subject<void>()

  constructor() {}

  connect(token: string, userId: string): void {

    if (this.isConnected && this.socket && (this.socket.io.opts.query as any)?.userId === userId) {
      console.log('Notification Socket already connected for this user.');
      return;
    }
    // Clean up existing connection
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


  private setupListeners(): void {
    if (!this.socket) {
      console.error('Socket not connected, cannot set up listeners.');
      return;
    }

    // General notifications
    this.socket.on('newNotification', (notification: INotification) => {
      console.log('Received new general notification:', notification);
      this.newNotificationSubject.next(notification);
    });

    // Chat message notifications
    this.socket.on('newChatMessage', (data: ChatNotificationData) => {
        console.log('Received new chat message notification:', data);
        this.newChatNotificationSubject.next(data);
    });

    // Admin notifications
    this.socket.on('newAdminNotification', (notification: INotification) => {
        console.log('Received new admin notification:', notification);
        this.newNotificationSubject.next(notification); // Or a separate subject if admin notifications need different UI
    });

    this.socket.on('end-call', () => {
      console.log('Received end-call signal from server.');
      this.endCallSubject.next();
    });
  }


  onNewNotification(): Observable<INotification> {
    console.log("onNewNotification");
    return this.newNotificationSubject.asObservable();
  }

  onNewAdminNotification(): Observable<INotification> {
    console.log("onNewAdminNotification");
    return this.newNotificationSubject.asObservable();
  }

  onNewChatNotification(): Observable<ChatNotificationData> {
      return this.newChatNotificationSubject.asObservable();
  }


  getConnectionStatus(): Observable<boolean> {
    return this.connectionStatus$.asObservable();
  }

  onEndCall(): Observable<void> {
    return this.endCallSubject.asObservable();
  }


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
      this.endCallSubject = new Subject<void>();
    }
  }

 
  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

//   setupCallListeners(): void {
//   this.socket?.on('newNotification', (notification: INotification) => {
//     if (notification.type === 'video-call') {
//       console.log('Received video call notification:', notification);
//       this.newNotificationSubject.next(notification);
//     }
//   });

//   this.socket?.on('end-call', ({ callId }) => {
 
//     console.log('Call ended remotely:', callId);
    
//   });
// }
}