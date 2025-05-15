import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';


export interface TableData {
  [key: string]: any;
  id?: string | number; 
}

export interface TableColumn {
  header: string;
  key: string; 
  type: 'text' | 'image' | 'button' | 'date' | 'status' | 'dropdown';
  dropdownOptions?: { label: string; value: string }[];
  buttonText?: string;
  buttonClass?: string; 
  width?: string; 
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss'
})
export class DataTableComponent {
  @Input() tableData: TableData[] = [];
  @Input() tableColumns: TableColumn[] = [];
  @Input() title: string = "";
  @Input() showImage: boolean = false;
  @Input() imageSource: string = '';
  @Input() isLoading: boolean = false;
  @Input() emptyMessage: string = 'No data available';
  @Input() currentPage: number = 1;
  @Input() pageSize: number = 10;
  @Input() totalPages: number = 1;
  
  // Events for buttons or row actions
  @Output() rowAction = new EventEmitter<{action: string, item: TableData}>();
  @Output() dropdownChange = new EventEmitter<{ itemId: string | number; field: string; newValue: string }>();
  @Output() pageChange = new EventEmitter<number>();
  // Method to handle button clicks
  onButtonClick(action: string, item: TableData): void {
    this.rowAction.emit({action, item});
  }

  onDropdownChange(field: string, newValue: string, item: TableData): void {
    const itemId = item.id;
    if (!itemId) {
      console.error('Item ID is missing:', item);
      return;
    }
    this.dropdownChange.emit({ itemId, field, newValue });
  }

  // Methods to handle pagination
  prevPage(): void {
    if (this.currentPage > 1) {
      this.pageChange.emit(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.pageChange.emit(this.currentPage + 1);
    }
  }
}