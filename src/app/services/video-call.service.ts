import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { StreamVideoClient, Call, StreamVideoParticipant } from '@stream-io/video-client';
import { NotificationSocketService } from './notification-socket.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VideoCallService {
  private client: StreamVideoClient | null = null;
  public currentCall: Call | null = null;
  private apiUrl = `${environment.BACK_END_API_URL}/admin/`;

  //signals for reactive state
  callStatus = signal<'disconnected' | 'connecting' | 'in-call'>('disconnected');
  remoteUserName = signal<string>('');

  localParticipant = signal<StreamVideoParticipant | undefined>(undefined);
  remoteParticipant = signal<StreamVideoParticipant | null>(null);
  private http = inject(HttpClient)
  private notificationSocket = inject(NotificationSocketService)
  
  constructor(
  ) { /* empty */ }

  private async fetchToken(userId: string): Promise<string> {
    try {
      const response = await this.http.post<{ data: { token: string } }>(`${this.apiUrl}stream-token`, { userId }).toPromise();
      console.log("token front end", response?.data.token);
      return response?.data.token || '';
    } catch (error) {
      console.error('Error fetching Stream token:', error);
      throw error;
    }
  }

  async initClient(userId: string, username: string) {
    if (this.client) return;
    this.callStatus.set('connecting');
    try {
      const token = await this.fetchToken(userId);
      console.log("token in initCall", token);
      this.client = new StreamVideoClient({ apiKey: environment.STREAM_API_KEY });
      console.log("client in initcall", this.client);
      await this.client.connectUser({ id: userId, name: username }, token);
      this.callStatus.set('disconnected');
    } catch (error) {
      console.error('Error initializing Stream client:', error);
      this.callStatus.set('disconnected');
      throw error;
    }
  }

  async startCall(technicianId: string, callId: string) {
    if (!this.client) throw new Error('Client not initialized');
    try {
      this.currentCall = this.client.call('default', callId);
      await this.currentCall.join({ create: true });
      this.callStatus.set('in-call');
      this.setupStreams();
      await this.http.post(`${environment.BACK_END_API_URL}/notification/video-call`, {
        recipientId: technicianId,
        type: 'video-call',
        message: 'Admin is calling for approval!',
        payload: { callId },
      }).toPromise();
      console.log("Video call notification request sent to backend successfully.");
    } catch (error) {
      console.error('Error starting call:', error);
      this.callStatus.set('disconnected');
      throw error;
    }
  }

  async joinCall(callId: string) {
    if (!this.client) throw new Error('Client not initialized');
    try {
      this.currentCall = this.client.call('default', callId);
      await this.currentCall.join();
      this.callStatus.set('in-call');
      this.setupStreams();
    } catch (error) {
      console.error('Error joining call:', error);
      this.callStatus.set('disconnected');
      throw error;
    }
  }

  private async setupStreams() {
    if (!this.currentCall) return;
    try {
      await this.currentCall.camera.enable();
      await this.currentCall.microphone.enable();

      // Set local participant
      this.currentCall.state.localParticipant$.subscribe(local => {
        this.localParticipant.set(local);
      });

      // Set remote participant (handles updates dynamically)
      this.currentCall.state.remoteParticipants$.subscribe(remoteParticipants => {
        if (remoteParticipants.length > 0) {
          const firstRemote = remoteParticipants[0];
          this.remoteParticipant.set(firstRemote);
          this.remoteUserName.set(firstRemote.name || 'Remote User');
        } else {
          this.remoteParticipant.set(null);
          this.remoteUserName.set('');
        }
      });
    } catch (error) {
      console.error('Error setting up streams:', error);
    }
  }

  muteAudio() {
    if (this.currentCall) this.currentCall.microphone.disable();
  }

  unmuteAudio() {
    if (this.currentCall) this.currentCall.microphone.enable();
  }

  toggleVideo(enable: boolean) {
    if (this.currentCall) {
      if (enable) this.currentCall.camera.enable();
      else this.currentCall.camera.disable();
    }
  }

  endCall() {
    this.currentCall?.leave();
    this.currentCall = null;
    this.callStatus.set('disconnected');
    this.localParticipant.set(undefined);
    this.remoteParticipant.set(null);
    this.remoteUserName.set('');
  }
}