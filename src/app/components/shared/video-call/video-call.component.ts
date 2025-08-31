import { Component, inject, signal, OnDestroy, OnInit, ViewChild, ElementRef, effect, runInInjectionContext, Injector } from '@angular/core';
import { VideoCallService } from '../../../services/video-call.service';
import { NotificationSocketService } from '../../../services/notification-socket.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectTempUserId, selectUsername, selectUserRole } from '../../../store/auth/auth.reducer';
import { Subscription, combineLatest, filter, first } from 'rxjs';

@Component({
  selector: 'app-video-call',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-call.component.html',
  styleUrl: './video-call.component.scss'
})
export class VideoCallComponent implements OnInit, OnDestroy {
  private videoCallService = inject(VideoCallService);
  private notificationSocket = inject(NotificationSocketService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private store = inject(Store);
  private injector = inject(Injector); 
  private subscriptions: Subscription = new Subscription();

  // Expose service signals
  callStatus = this.videoCallService.callStatus;
  remoteUserName = this.videoCallService.remoteUserName;
  localParticipant = this.videoCallService.localParticipant;
  remoteParticipant = this.videoCallService.remoteParticipant;

  @ViewChild('localVideo') localVideoEl!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideoEl!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteAudio') remoteAudioEl!: ElementRef<HTMLAudioElement>;

  // Local component state
  isAudioMuted = signal(false);
  isVideoEnabled = signal(true);
  incomingCall = signal<any | null>(null);

  // Store userRole as a component property
  userRole: string | null = null;

  // Unbind functions
  private unbindLocalVideo?: () => void;
  private unbindRemoteVideo?: () => void;
  private unbindRemoteAudio?: () => void;
  private isInitialized = false; 

  constructor() {
    
  }

  ngOnInit() {
    this.subscriptions.add(
      combineLatest([
        this.store.select(selectTempUserId).pipe(filter(id => !!id)),
        this.store.select(selectUsername).pipe(filter(name => !!name)),
        this.store.select(selectUserRole).pipe(filter(role => !!role)),
      ]).pipe(first()).subscribe(async ([userId, username, role]) => {
        this.userRole = role; // Store the user role
        await this.videoCallService.initClient(userId!, username!);
        const technicianId = this.route.snapshot.paramMap.get('id');
        const callIdFromRoute = this.route.snapshot.paramMap.get('callId');
        console.log("User Role:", role);
        console.log("Technician ID from route:", technicianId);
        console.log("Call ID from route:", callIdFromRoute);
        if (role === 'admin' && technicianId) {
          const callId = `partner-verification-${Date.now()}`;
          this.videoCallService.startCall(technicianId, callId);
        } else if (role === 'partner' && callIdFromRoute) {
          this.videoCallService.joinCall(callIdFromRoute);
        } else {
          console.error('Invalid route parameters or user role. Redirecting.');
          this.navigateBasedOnRole();
        }
      })
    );
    this.subscriptions.add(
      this.notificationSocket.onEndCall().subscribe(() => {
        console.log('Call ended by the other party. Redirecting to dashboard.');
        this.videoCallService.endCall();
        this.navigateBasedOnRole();
      })
    );
  }

  ngAfterViewInit() {
    if (this.isInitialized) return; // Prevent multiple initializations
    this.isInitialized = true;

    let lastLocalId: string | undefined;
    let lastRemoteId: string | undefined;

    // Run effects in injection context using the component's injector
    runInInjectionContext(this.injector, () => {
      // Local participant binding
      effect(() => {
        const local = this.localParticipant();
        const el = this.localVideoEl?.nativeElement;
        const call = this.videoCallService.currentCall;
        if (!local || !el || !call) return;

        if (lastLocalId !== local.sessionId) {
          if (this.unbindLocalVideo) this.unbindLocalVideo();
          this.unbindLocalVideo = call.bindVideoElement(el, local.sessionId, 'videoTrack');
          lastLocalId = local.sessionId;
          console.log('Bound local video, sessionId:', local.sessionId);
        }
      });

      // Remote participant binding
      effect(() => {
        const remote = this.remoteParticipant();
        const videoEl = this.remoteVideoEl?.nativeElement;
        const audioEl = this.remoteAudioEl?.nativeElement;
        const call = this.videoCallService.currentCall;
        if (!remote || !videoEl || !audioEl || !call) {
          if (this.unbindRemoteVideo) { this.unbindRemoteVideo(); this.unbindRemoteVideo = undefined; }
          if (this.unbindRemoteAudio) { this.unbindRemoteAudio(); this.unbindRemoteAudio = undefined; }
          lastRemoteId = undefined;
          return;
        }

        if (lastRemoteId !== remote.sessionId) {
          if (this.unbindRemoteVideo) this.unbindRemoteVideo();
          if (this.unbindRemoteAudio) this.unbindRemoteAudio();

          this.unbindRemoteVideo = call.bindVideoElement(videoEl, remote.sessionId, 'videoTrack');
          this.unbindRemoteAudio = call.bindAudioElement(audioEl, remote.sessionId);
          lastRemoteId = remote.sessionId;
          console.log('Bound remote video and audio, sessionId:', remote.sessionId);
        }
      });
    });
  }

  ngOnDestroy() {
    if (this.unbindLocalVideo) this.unbindLocalVideo();
    if (this.unbindRemoteVideo) this.unbindRemoteVideo();
    if (this.unbindRemoteAudio) this.unbindRemoteAudio();

    if (this.videoCallService.callStatus() === 'in-call') {
      this.videoCallService.endCall();
    }
    this.subscriptions.unsubscribe();
  }

  toggleAudio() {
    if (this.isAudioMuted()) {
      this.videoCallService.unmuteAudio();
    } else {
      this.videoCallService.muteAudio();
    }
    this.isAudioMuted.set(!this.isAudioMuted());
  }

  toggleVideo() {
    this.isVideoEnabled.set(!this.isVideoEnabled());
    this.videoCallService.toggleVideo(this.isVideoEnabled());
  }

  endCall() {
    this.videoCallService.endCall();
    this.navigateBasedOnRole();
  }

  private navigateBasedOnRole() {
    if (this.userRole === 'partner') {
      this.router.navigate(['/partner-dashboard']);
    } else {
      this.router.navigate(['/admin-dashboard']);
    }
  }
}