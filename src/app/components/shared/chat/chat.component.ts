// import { Component, Input } from '@angular/core';
// import { SocketService } from '../../../services/socket.service';
// import { HttpClient } from '@angular/common/http';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';

// @Component({
//   selector: 'app-chat',
//   imports: [CommonModule, FormsModule],
//   templateUrl: './chat.component.html',
//   styleUrl: './chat.component.scss'
// })
// export class ChatComponent {
//   @Input() bookingId!: string;
//   @Input() senderId!: string;
//   @Input() role!: string;

//   messages: any[] = [];
//   newMessage: string = '';

//   constructor(private socketService: SocketService, private http: HttpClient) {}

//   ngOnInit(): void {
//     // Join chat room
//     this.socketService.joinRoom(this.bookingId);

//     // Fetch existing messages
//     this.http.get<any>(`/chat/${this.bookingId}`).subscribe((res) => {
//       this.messages = res.data;
//     });

//     // Listen for real-time messages
//     this.socketService.onMessage((msg) => {
//       this.messages.push(msg);
//     });
//   }

//   send(): void {
//     if (!this.newMessage.trim()) return;

//     this.socketService.sendMessage({
//       bookingId: this.bookingId,
//       message: this.newMessage,
//       senderId: this.senderId,
//       role: this.role,
//     });

//     this.newMessage = '';
//   }

//   ngOnDestroy(): void {
//     this.socketService.disconnect();
//   }
// }
