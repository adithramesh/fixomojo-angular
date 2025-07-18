import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-service-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './service-card.component.html',
  styleUrls: ['./service-card.component.scss']
})
export class ServiceCardComponent {
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() price: string = '';
  @Input() isHomePage: boolean = false;
  @Input() imageUrl: string = '';
  @Input() status: string = '';
  @Input() showBookButton: boolean = true;
  @Input() searchTerm: string = '';
  @Output() bookClicked = new EventEmitter<void>();

  highlightSearch(text: string, searchTerm: string): string {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
  }
}