import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { SocketService, ChatMessage } from './socket.service';
import { environment } from '../../environments/environment';

export interface ChatState {
  isOpen: boolean;
  bookingId: string | null;
  messages: ChatMessage[];
  currentUserId: string | null;
  currentUserRole: 'user' | 'partner' | null;
  isLoading: boolean;
  error: string | null;
  counterPartyName?: string | null; 
}

export interface ChatData {
  bookingId: string;
  userId: string;
  userRole: 'user' | 'partner';
  customerName?: string;
  serviceName?: string;
  technicianName?: string;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private apiUrl = `${environment.BACK_END_API_URL}`;
  
  // Chat state using BehaviorSubject
  private chatState$ = new BehaviorSubject<ChatState>({
    isOpen: false,
    bookingId: null,
    messages: [],
    currentUserId: null,
    currentUserRole: null,
    isLoading: false,
    error: null
  });

  private messageSubscription: Subscription | null = null;

  constructor(
    private socketService: SocketService,
    private http: HttpClient
  ) {}

  // Get chat state observable
  getChatState(): Observable<ChatState> {
    return this.chatState$.asObservable();
  }

  // Get current chat state
  getCurrentChatState(): ChatState {
    return this.chatState$.value;
  }

  // Open chat for a booking
  async openChat(chatData: ChatData, authToken: string): Promise<void> {
    try {
      // Update state to loading
      this.updateChatState({
        isLoading: true,
        error: null
      });

      // Connect socket if not connected
      if (!this.socketService.isSocketConnected()) {
        this.socketService.connect(authToken,  chatData.bookingId);
        
        // Wait for connection
        await new Promise((resolve, reject) => {
          const sub = this.socketService.getConnectionStatus().subscribe(connected => {
            if (connected) {
              sub.unsubscribe();
              resolve(void 0);
            }
          });
          
          // Timeout after 5 seconds
          setTimeout(() => {
            sub.unsubscribe();
            reject(new Error('Socket connection timeout'));
          }, 5000);
        });
      }

      // Join room
    //   this.socketService.joinRoom(chatData.bookingId);

      // Load chat history
      const messages = await this.loadChatHistory(chatData.bookingId);

      let counterPartyName = null;
      if (chatData.userRole === 'user') {
        counterPartyName = chatData.technicianName || 'Technician'; 
      } else if (chatData.userRole === 'partner') {
        counterPartyName = chatData.customerName || 'Customer';
      }
      // Subscribe to new messages
      this.subscribeToMessages();

      // Update state
      this.updateChatState({
        isOpen: true,
        bookingId: chatData.bookingId,
        currentUserId: chatData.userId,
        currentUserRole: chatData.userRole,
        messages,
        isLoading: false,
        error: null,
        counterPartyName 
      });

    } catch (error: any) {
      console.error('Error opening chat:', error);
      this.updateChatState({
        isLoading: false,
        error: error.message || 'Failed to open chat'
      });
    }
  }

  // Close chat
  closeChat(): void {
    // Unsubscribe from messages
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
      this.messageSubscription = null;
    }

    // Reset state
    this.updateChatState({
      isOpen: false,
      bookingId: null,
      messages: [],
      currentUserId: null,
      currentUserRole: null,
      isLoading: false,
      error: null
    });
  }

  // Send message
  sendMessage(messageText: string): void {
    const currentState = this.getCurrentChatState();
    
    if (!currentState.bookingId || !messageText.trim()) {
      return;
    }
    console.log("chat service messageText.trim()",messageText.trim());
    this.socketService.sendMessage({
        
        
      bookingId: currentState.bookingId,
      messageText: messageText.trim()
    });
  }

  // Load chat history from API
  private async loadChatHistory(bookingId: string): Promise<ChatMessage[]> {
    try {
      const response = await this.http.get<{
        success: boolean;
        data: ChatMessage[];
        message: string;
      }>(`${this.apiUrl}/chat/${bookingId}`).toPromise();

      if (response?.success) {
        return response.data || [];
      } else {
        throw new Error(response?.message || 'Failed to load chat history');
      }
    } catch (error: any) {
      console.error('Error loading chat history:', error);
      throw error;
    }
  }


private subscribeToMessages(): void {
  console.log('🔄 ChatService: subscribeToMessages() called');
  
  if (this.messageSubscription) {
    console.log('🗑️ ChatService: Unsubscribing from previous subscription');
    this.messageSubscription.unsubscribe();
  }

  console.log('🔌 ChatService: Creating new subscription to socketService.onMessage()');
  
  this.messageSubscription = this.socketService.onMessage().subscribe({
    next: (message: ChatMessage) => {
      console.log('📥 ChatService: Received message from SocketService:', message);
      
      const currentState = this.getCurrentChatState();
      console.log('📊 ChatService: Current messages count:', currentState.messages.length);
      
      // Add message to current messages
      const updatedMessages = [...currentState.messages, message];
      console.log('📊 ChatService: Updated messages count:', updatedMessages.length);
      
      this.updateChatState({
        messages: updatedMessages
      });
      
      console.log('✅ ChatService: State updated, should trigger component update');
    },
    error: (error) => {
      console.error('❌ ChatService: Error receiving message:', error);
      this.updateChatState({
        error: 'Error receiving messages'
      });
    }
  });
  
  console.log('✅ ChatService: Message subscription created');
}

  // Update chat state
  private updateChatState(updates: Partial<ChatState>): void {
    const currentState = this.getCurrentChatState();
    const newState = { ...currentState, ...updates };
    this.chatState$.next(newState);
  }

  // Cleanup on service destroy
  ngOnDestroy(): void {
    this.closeChat();
    this.socketService.disconnect();
  }
}