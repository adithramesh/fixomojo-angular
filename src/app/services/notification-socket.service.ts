import { Injectable, inject, PLATFORM_ID } from "@angular/core";  
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable, Subject } from 'rxjs';  
import { isPlatformBrowser } from '@angular/common';  
import { environment } from "../../environments/environment";
import { INotification } from "./notification.service";

export interface ChatNotificationData {
  bookingId: string;
  senderId: string;
  message: string;
  createdAt?: string;
  senderType: 'user' | 'technician';
  senderName?: string;
}

export interface EndCallData {
  reason?: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationSocketService {
  public socket: Socket | null = null;
  private isConnected = false;
  private apiUrl = `${environment.BACK_END_API_URL}`;
  private platformId = inject(PLATFORM_ID);  // Add: For SSR guard

  private connectionStatus$ = new BehaviorSubject<boolean>(false);
  private newNotificationSubject = new Subject<INotification>();
  private newChatNotificationSubject = new Subject<ChatNotificationData>();
  private endCallSubject = new Subject<EndCallData>();

  connect(token: string, userId: string): void {
    if (!isPlatformBrowser(this.platformId)) {  // Add: SSR skip
      console.warn('Socket connect skipped on server-side');
      return;
    }

    const socketQuery = this.socket?.io.opts.query as { userId?: string };
    if (this.isConnected && this.socket && socketQuery.userId === userId) {
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
        userId: userId
      },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Notification Socket connected:', this.socket?.id);
      this.isConnected = true;
      this.connectionStatus$.next(true);
      this.setupListeners();
    });

    this.socket.on('disconnect', () => {
      console.log('Notification Socket disconnected');
      this.isConnected = false;
      this.connectionStatus$.next(false);
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

    this.socket.on('newNotification', (notification: INotification) => {
      console.log('Received new general notification:', notification);
       if (notification.type === 'SystemAlert') {
          this.showSystemAlertToast(notification.message);
        }
      this.newNotificationSubject.next(notification);
    });

    this.socket.on('newChatMessage', (data: ChatNotificationData) => {
      console.log('Received new chat message notification:', data);
      this.showChatToast(data);
    });

    this.socket.on('newAdminNotification', (notification: INotification) => {
      console.log('Received new admin notification:', notification);
      this.newNotificationSubject.next(notification);
    });

    this.socket.on('end-call', (data: EndCallData) => {
      console.log('Received end-call signal from server:', data);
      this.endCallSubject.next(data);
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

  onEndCall(): Observable<EndCallData> {
    return this.endCallSubject.asObservable();
  }

  disconnect(): void {
    if (this.socket) {
      console.log('Disconnecting Notification Socket...');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.connectionStatus$.next(false);
      this.newNotificationSubject = new Subject<INotification>();
      this.newChatNotificationSubject = new Subject<ChatNotificationData>();
      this.endCallSubject = new Subject<EndCallData>();
    }
  }

  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  private showChatToast(data: ChatNotificationData): void {
    console.log(`🔔 New chat from ${data.senderName}: ${data.message}`);
  }

  private showSystemAlertToast(message: string): void {
    console.log(`🚨 SYSTEM ALERT: ${message}`);
    alert(`🚨 ${message}`);
  }
}