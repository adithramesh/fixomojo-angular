import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-service-card',
  imports: [CommonModule],
  templateUrl: './service-card.component.html',
  styleUrl: './service-card.component.scss'
})
export class ServiceCardComponent {
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() price: string = '';
  @Input() imageUrl: string = '';
}
