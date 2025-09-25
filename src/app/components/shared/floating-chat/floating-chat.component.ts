import { Component, ElementRef, inject, ViewChild } from '@angular/core';
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
    error: null,
    counterPartyName: null
  };

  newMessage = '';
  isOnline = true;
  private chatSubscription: Subscription | null = null;
  private shouldScrollToBottom = false;
  private chatService = inject(ChatService)
  

  ngOnInit(): void {

    this.chatSubscription = this.chatService.getChatState().subscribe(state => {
      console.log('Chat state updated:', state);
      const previousMessageCount = this.chatState.messages.length;
      this.chatState = state;
      
      console.log("chatState", this.chatState);
      
      if (state.messages.length > previousMessageCount) {
        console.log('First message createdAt:', state.messages[0].createdAt);
    console.log('Type of createdAt:', typeof state.messages[0].createdAt);
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
formatDate(dateStr: string): string {

  if (!dateStr) {
    return new Date().toLocaleString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }

  const date = new Date(dateStr);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    console.warn('Invalid date string:', dateStr);
    return 'Invalid Date';
  }

  return date.toLocaleString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}
  private scrollToBottom(): void {
    if (this.messagesContainer) {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }


}
