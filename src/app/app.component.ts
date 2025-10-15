import { Component, inject, PLATFORM_ID } from '@angular/core';
import { NavigationStart, Router, RouterOutlet } from '@angular/router';
import { FloatingChatComponent } from './components/shared/floating-chat/floating-chat.component';
import { Subscription } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FloatingChatComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'front-end';

  private subscriptions: Subscription = new Subscription();
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  get isBrowser() {
    return isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    // Watch for navigation events for debugging
    this.subscriptions.add(
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationStart) {
          if (this.isBrowser) {
            // only log in browser environment (prevents server/prerender logs)
            console.log('Navigating to:', event.url);
          }
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
