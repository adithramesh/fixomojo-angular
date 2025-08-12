import { Component } from '@angular/core';
import { NavigationStart, Router, RouterOutlet } from '@angular/router';
import { FloatingChatComponent } from './components/shared/floating-chat/floating-chat.component';


@Component({
    selector: 'app-root',
    imports: [RouterOutlet, FloatingChatComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'front-end';
  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        console.log('Navigating to:', event.url);
      }
    });
  }
}
