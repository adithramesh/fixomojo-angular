import { Injectable } from "@angular/core";
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from "../../environments/environment";

export interface ChatMessage {
  messageId: string;
  bookingId: string;
  messageText: string;
  senderType: 'user' | 'technician';
  senderId: string;
  createdAt: Date;
}

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private apiUrl = `${environment.BACK_END_API_URL}`;
  
  // Subject to track connection status
  private connectionStatus$ = new BehaviorSubject<boolean>(false);
  
  constructor() {}

  // Initialize socket connection with auth token
  connect(token: string, bookingId: string): void {
    if (this.isConnected && this.socket) {
      return; // Already connected
    }

    this.socket = io(this.apiUrl, {
      auth: {
        token: `Bearer ${token}` // Your backend expects this format
      },
       query: {
        bookingId: bookingId  // ✅ FIXED: Add bookingId to query
      },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
      this.isConnected = true;
      this.connectionStatus$.next(true);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.isConnected = false;
      this.connectionStatus$.next(false);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.isConnected = false;
      this.connectionStatus$.next(false);
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  // Join a booking room
  // joinRoom(bookingId: string): void {
  //   if (!this.socket || !this.isConnected) {
  //     console.error('Socket not connected');
  //     return;
  //   }
    
  //   // Your backend automatically joins room based on bookingId in query
  //   // But we can emit a custom event if needed
  //   console.log(`Joining room for booking: ${bookingId}`);
  // }

  // Send message - FIXED EVENT NAME
  sendMessage(data: { bookingId: string; messageText: string }): void {

    console.log("socket service data (booking,messagetext)",data);
    if (!this.socket || !this.isConnected) {
      console.error('Socket not connected');
      return;
    }
    
    // Fixed: Use 'message' to match backend
    this.socket.emit('message', data);
  }

  // Listen for messages - FIXED EVENT NAME
  // onMessage(): Observable<ChatMessage> {
  //   return new Observable(observer => {
  //     if (!this.socket) {
  //       observer.error('Socket not connected');
  //       return;
  //     }

  //     // Fixed: Listen for 'message' from backend
  //     this.socket.on('message', (message: ChatMessage) => {
  //       observer.next(message);
  //     });

  //     // Cleanup on unsubscribe
  //     return () => {
  //       if (this.socket) {
  //         this.socket.off('message');
  //       }
  //     };
  //   });
  // }
  onMessage(): Observable<ChatMessage> {
  console.log('🔌 SocketService: onMessage() called - creating observable');
  
  return new Observable(observer => {
    if (!this.socket) {
      console.error('❌ SocketService: No socket available');
      observer.error('Socket not connected');
      return;
    }

    console.log('✅ SocketService: Setting up socket.on("message") listener');

    // Fixed: Listen for 'message' from backend
    this.socket.on('message', (message: ChatMessage) => {
      console.log('📨 SocketService: Received message from backend:', message);
      console.log('📨 Message details:', {
        messageId: message.messageId,
        messageText: message.messageText,
        senderType: message.senderType,
        bookingId: message.bookingId
      });
      
      observer.next(message);
      console.log('✅ SocketService: Message passed to observer');
    });

    // Cleanup on unsubscribe
    return () => {
      console.log('🧹 SocketService: Cleaning up message listener');
      if (this.socket) {
        this.socket.off('message');
      }
    };
  });
}

  // Get connection status
  getConnectionStatus(): Observable<boolean> {
    return this.connectionStatus$.asObservable();
  }

  // Disconnect socket
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.connectionStatus$.next(false);
    }
  }

  // Check if connected
  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }
}