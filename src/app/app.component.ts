import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FloatingChatComponent } from './components/shared/floating-chat/floating-chat.component';


@Component({
    selector: 'app-root',
    imports: [RouterOutlet, FloatingChatComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'front-end';
}
