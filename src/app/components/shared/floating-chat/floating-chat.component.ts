import { Component, ElementRef, ViewChild } from '@angular/core';
import { ChatService, ChatState } from '../../../services/chat.service';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChatMessage } from '../../../services/socket.service';

@Component({
  selector: 'app-floating-chat',
  imports: [FormsModule, CommonModule],
  templateUrl: './floating-chat.component.html',
  styleUrl: './floating-chat.component.scss'
})
export class FloatingChatComponent {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  chatState: ChatState = {
    isOpen: false,
    bookingId: null,
    messages: [],
    currentUserId: null,
    currentUserRole: null,
    isLoading: false,
    error: null
  };

  newMessage: string = '';
  isOnline: boolean = true;
  private chatSubscription: Subscription | null = null;
  private shouldScrollToBottom = false;

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {

    this.chatSubscription = this.chatService.getChatState().subscribe(state => {
      console.log('Chat state updated:', state);
      const previousMessageCount = this.chatState.messages.length;
      this.chatState = state;
      
      
      if (state.messages.length > previousMessageCount) {
        this.shouldScrollToBottom = true;
      }
    });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  ngOnDestroy(): void {
    if (this.chatSubscription) {
      this.chatSubscription.unsubscribe();
    }
  }

  sendMessage(): void {
    if (!this.newMessage.trim()) {
      return;
    }
     console.log('Sending message:', this.newMessage); 
    this.chatService.sendMessage(this.newMessage);
    this.newMessage = '';
    this.shouldScrollToBottom = true;
  }

  closeChat(): void {
    this.chatService.closeChat();
  }


  isMyMessage(message: ChatMessage): boolean {

    if (this.chatState.currentUserRole === 'user') {
      return message.senderType === 'user';
    } else if (this.chatState.currentUserRole === 'partner') {
      return message.senderType === 'technician';
    }
    return false;
  }

  formatTime(date: Date): string {
    const messageDate = new Date(date);
    const now = new Date();
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } else {
      return messageDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    }
  }

  private scrollToBottom(): void {
    if (this.messagesContainer) {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }
}
