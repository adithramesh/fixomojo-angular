import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { OfferService } from '../../../services/offer.service';
import { CommonModule } from '@angular/common';
import { NavBarComponent } from '../../shared/nav-bar/nav-bar.component';
import { SidebarComponent } from '../side-bar/side-bar.component';
import { DataTableComponent, TableColumn, TableData } from '../../shared/data-table/data-table.component';
import { Subscription, Subject, debounceTime, distinctUntilChanged, catchError, of } from 'rxjs';

@Component({
  selector: 'app-offer-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NavBarComponent, SidebarComponent, DataTableComponent],
  templateUrl: './offer-management.component.html',
  styleUrls: ['./offer-management.component.scss'],
})
export class OfferManagementComponent implements OnInit, OnDestroy {
  offers: any[] = []; // Raw offers from API
  offerTableData: TableData[] = [];
  offerTableColumns: TableColumn[] = [
    { header: 'Sl', key: 'sl', type: 'text', width: '5%' },
    { header: 'Title', key: 'title', type: 'text', width: '20%' },
    { header: 'Description', key: 'description', type: 'text', width: '30%' },
    { header: 'Status', key: 'status', type: 'status', width: '15%' },
    { header: 'Type', key: 'type', type: 'text', width: '10%' },
    { header: 'Value ', key: 'value', type: 'text', width: '10%' },
    { header: 'Edit', key: 'edit', type: 'button', buttonText: 'Edit', buttonClass: 'action-button', width: '10%' },
    { header: 'Change Status', key: 'toggle', type: 'button', buttonClass: 'block-button', 
      buttonTextFn: (item: TableData) => item.status === 'Active' ? 'Block' : 'Unblock', width: '10%' },
    { header: 'Delete', key: 'delete', type: 'button', buttonText: 'Delete', buttonClass: 'action-button', width: '10%' }
  ];
  totalItems = 0;
  page = 1;
  pageSize = 10;
  filterForm: FormGroup;
  statusFilter: string = '';
  searchTerm: string = '';
  private searchSubject = new Subject<string>();
  private subscription: Subscription = new Subscription();
  isLoading = false;
  Math = Math;

  constructor(
    private offerService: OfferService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.filterForm = this.fb.group({
      status: [''],
    });
  }

  ngOnInit(): void {
    this.subscription.add(this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.searchTerm = searchTerm;
      this.page = 1;
      this.loadOffers();
    }));
    this.loadOffers();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  loadOffers(): void {
    this.isLoading = true;
    const filter: any = {};
    if (this.statusFilter) {
      filter.status = this.statusFilter;
    }
    if (this.searchTerm) {
      filter.search = this.searchTerm; 
    }
    this.offerService.getAllOffers(this.page, this.pageSize, 'createdAt', 'desc', filter).subscribe(
      (data) => {
        this.offers = data.data.offers;
        this.totalItems = data.data.pagination.total;
        this.offerTableData = this.offers.map((offer: any, index: number) => ({
          id: offer._id,
          sl: (this.page - 1) * this.pageSize + index + 1,
          title: offer.title,
          description:offer.description,
          status: offer.status,
          type:offer.discount_type,
          value:offer.discount_value,
          edit: 'edit',
          toggle: 'toggle'
        }));
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading offers:', error);
        this.isLoading = false;
      }
    );
  }

  onPageChange(page: number): void {
    this.page = page;
    this.loadOffers();
  }

  onFilterChange(): void {
    this.statusFilter = this.filterForm.get('status')?.value || '';
    this.page = 1;
    this.loadOffers();
  }

  handleAction(event: { action: string, item: TableData }): void {
    const offerId = event.item.id as string;
    switch (event.action) {
      case 'edit':
        this.editOffer(offerId);
        break;
      case 'toggle':
        this.toggleStatus(offerId);
        break;
      case 'delete':
        this.deleteOffer(offerId);
        break;
    }
  }

  editOffer(id: string): void {
    if (id) {
      this.router.navigate([`/offers/edit/${id}`]);
    }
  }

  toggleStatus(id: string): void {
    if (id) {
      this.offerService.toggleOfferStatus(id).subscribe(
        () => this.loadOffers(),
        (error) => console.error('Error toggling status:', error)
      );
    }
  }

   deleteOffer(id:string):void {
    if(id){   
      this.offerService.deleteOffer(id).pipe(
        catchError((error) => {
          console.error('Error deleting offer:', error);
          return of({ success: false, message: 'Failed to delete offer' });
        })
      ).subscribe(() => {
        this.loadOffers();
      });
    }
  }

  addNewOffer(): void {
    this.router.navigate(['/offers/add']);
  }

  onSearchChange(searchTerm: string): void {
    this.searchSubject.next(searchTerm);
  }
}