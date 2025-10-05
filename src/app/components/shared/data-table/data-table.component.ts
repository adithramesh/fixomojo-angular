import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, inject, ViewChild, ElementRef,SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { selectUserRole } from '../../../store/auth/auth.reducer';
import { Subject, takeUntil } from 'rxjs';


export interface TableData {
  sl?:number;
  toggle?:string;
  id?: string|number;
  Id?:string;
  _id?:string | undefined;
  displayId?:string;
  phoneNumber?:number| string;
  image?: string;
  title?:string;
  serviceName?: string;
  subServiceId?: string;
  subServiceName?: string;
  description?: string;
  price?: string;
  status?: string;
  book?: string;
  edit?: string;
  totalAmount?: string |number;
  bookingStatus?: "Hold" |"Pending" | "Confirmed" | "Cancelled"| "Completed" | "Failed" |string;
  paymentStatus?: "Pending" | "Success" | "Failed";
  isCompleted?: boolean |string;
  username?: string; 
  createdAt?: string; 
  block?: string; 
  location?: {
      address?: string;
      latitude: number;
      longitude: number;
   } | string ;
  timeSlotStart?: Date |string; 
  timeSlotEnd?: Date |string; 
  paymentMethod?:string;
  discount_type?:string;
  discount_value?:number;
  value?:string |number;
  email?: string; 
  technicianId?: string; 
  technicianName?:string;
  licenseStatus?:string;
  videoCall?:string;
  
}

export interface TableColumn {
  header: string;
  key: string; 
  type: 'text' | 'image' | 'button' | 'date' | 'status' | 'dropdown' | 'action-buttons';
  dropdownOptions?: { label: string; value: string }[];
  buttonText?: string;
  buttonClass?: string; 
  buttonTextFn?: (item: TableData) => string;
  width?: string; 
  className?: string
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss',
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataTableComponent {
  @Input() tableData: TableData[] = [];
  @Input() tableColumns: TableColumn[] = [];
  @Input() title = "";
  @Input() showImage = false;
  @Input() imageSource = '';
  @Input() isLoading = false;
  @Input() emptyMessage = 'No data available';
  @Input() currentPage = 1;
  @Input() pageSize = 10;
  @Input() totalPages = 1;
  @Input() showAddButton = false;
  @Input() searchTerm = '';
  @Input() showSearch = true;
  @Input() searchPlaceholder = 'Search...';
  
  
  // Events for buttons or row actions
  @Output() rowAction = new EventEmitter<{action: string, item: TableData}>();
  @Output() dropdownChange = new EventEmitter<{ itemId: string | number; field: string; newValue: string }>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() addItem = new EventEmitter<void>();
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
 

  private _store = inject(Store)
  private _role!:string
  private destroy$ = new Subject<void>();
  ngOnInit(){
     this._store
        .select(selectUserRole)
        .pipe(takeUntil(this.destroy$))
        .subscribe(role => {
          if (role) {
            this._role = role;
          }
        });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['searchTerm'] && this.searchInput) {
      this.searchInput.nativeElement.value = this.searchTerm;
    }
  }
  onButtonClick(action: string, item: TableData): void {
    this.rowAction.emit({action, item});
  }

  onImageClick(item: TableData): void {
    this.rowAction.emit({action: 'image', item});
  }

  onDropdownChange(field: string, newValue: string, item: TableData): void {
    const itemId = item.id;
    if (!itemId) {
      console.error('Item ID is missing:', item);
      return;
    }
    this.dropdownChange.emit({ itemId, field, newValue });
  }


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



  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target) {
        this.searchChange.emit(target.value);
      }
    } 

  onImageError(event: Event): void {
  const target = event.target as HTMLImageElement;
  if (target) {
      target.style.display = 'none';
    }
  }

  onAddClick(): void {
    this.addItem.emit();
  }

shouldShowChatButton(item: TableData): boolean {
  // console.log("item.isCompleted", item.isCompleted);
  
  return item.bookingStatus === 'Confirmed'  
  // && !item.isCompleted;
  
}

shouldShowCompleteButton(item: TableData): boolean {
  if(item.timeSlotStart && this._role==='partner'){
    console.log("this.isToday(item.timeSlotStart.toString())", this.isToday(item.timeSlotStart.toString()));
    
  return item.bookingStatus === 'Confirmed'  && 
        this.isToday(item.timeSlotStart.toString())
        //  && !item.isCompleted
  }else{
    return false
  }
}

shouldShowCancelButton(item: TableData): boolean {
  return item.bookingStatus === 'Confirmed' ; 
}

private isToday(dateString: string): boolean {
  const today = new Date();
  const bookingDate = new Date(dateString);

  return today.toDateString() === bookingDate.toDateString();
}

getItemValue(item: TableData, key: string): unknown {
  return (item as Record<string, unknown>)[key];
}

getItemValueAsString(item: TableData, key: string): string {
  return String((item as Record<string, unknown>)[key] || '');
}

getItemValueAsDate(item: TableData, key: string): string | number | Date | null {
  const value = (item as Record<string, unknown>)[key];
  return value as string | number | Date | null;
}

updateItemValue(item: TableData, key: string, value: string | number | boolean | null | undefined): void {
  (item as Record<string, unknown>)[key] = value;
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
}