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
  @Input() title = '';
  @Input() description = '';
  @Input() price = '';
  @Input() isHomePage = false;
  @Input() imageUrl = '';
  @Input() status = '';
  @Input() showBookButton = true;
  @Input() searchTerm = '';
  @Output() bookClicked = new EventEmitter<void>();

  highlightSearch(text: string, searchTerm: string): string {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
  }
}