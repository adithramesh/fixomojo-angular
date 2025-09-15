import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WalletService } from '../../../services/wallet.service';
import { CommonModule } from '@angular/common';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { SidebarComponent } from '../../admin/side-bar/side-bar.component';
import { PartnerSideBarComponent } from '../../partner/partner-side-bar/partner-side-bar.component';
import { TransactionService } from '../../../services/transaction.service';
import { PaginationRequestDTO } from '../../../models/admin.model';
import { debounceTime, distinctUntilChanged, Subject, Subscription } from 'rxjs';
import { DataTableComponent, TableColumn } from '../data-table/data-table.component';
import { Transaction } from '../../../models/wallet.model';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';


@Component({
  selector: 'app-wallet',
  imports: [CommonModule, NavBarComponent, SidebarComponent, PartnerSideBarComponent, FormsModule, DataTableComponent],
  templateUrl: './wallet.component.html',
  styleUrl: './wallet.component.scss',
  standalone: true
})
export class WalletComponent implements OnInit {
  role: 'user' | 'partner' | 'admin' = 'user';
  referenceId: string = '';
  
  walletBalance: number = 0;
  currency = 'INR';
  isLoading!:boolean;
  error: string | null = null;
  transactions!: Transaction; 
  transactionTableData: Transaction[] = []; 
  searchTerm: string = '';
  amountToAdd: number = 0;
  showRechargeInput:boolean = false;
  today: string = new Date().toISOString().split('T')[0];


  private route= inject(ActivatedRoute)
  private walletService=inject(WalletService)
  private transactionService=inject(TransactionService)
  private _subscription: Subscription = new Subscription();
  private _store = inject(Store)
  private searchSubject = new Subject<string>();

  pagination: PaginationRequestDTO = {
      page: 1,
      pageSize: 8,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      searchTerm: '',
      filter: {
        transactionType:''
      } 
    };
    totalTransactions = 0;
    totalPages = 0;


  tableColumns: TableColumn[] = [
    { header: 'Transaction Id', key: '_id', type: 'text', width: '15%' },
    { header: 'Date & Time', key: 'createdAt', type: 'date', width: '20%' },
    { header: 'Type', key: 'transactionType', type: 'status', width: '15%' },
    { header: 'Amount', key: 'amount', type: 'text', width: '15%' },
    { header: 'Purpose', key: 'purpose', type: 'text', width: '35%' }
  ];  
  
  ngOnInit(): void {
    this.isLoading=true;
    this.route.data.subscribe(data => {
      this.role = data['role'] || 'user';
    });



    this.transactionService.countTransactions().subscribe(count=>{
      if(count){   
        this.totalTransactions=count.count
      }
    })

    this._subscription.add(
      this.searchSubject.pipe(
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe(searchTerm => {
        this.searchTerm = searchTerm;
        this.pagination.searchTerm = searchTerm;
        this.pagination.page = 1;
        this.fetchTransactions();
      })
    );    

    this.fetchWallet();
    this.fetchTransactions();
  }

  ngOnDestroy() {
    if (this._subscription) {
      this._subscription.unsubscribe();
    }
  }

  fetchWallet(): void {
    this.walletService.getWallet().subscribe({
      next:(response)=>{

            if (response.success && response.wallet) {
              this.isLoading=false
                this.walletBalance = response.wallet.balance;
            } else {
                console.error('Failed to fetch wallet:', response.message);
                this.walletBalance = 0;
            }
      },
      error:(err)=>{
        this.isLoading=false
         console.error('Error loading users:', err);
         this.walletBalance = 0;
      }
    })
  }

  fetchTransactions(): void {
    this.transactionService.getTransactions(this.pagination).subscribe({
      next:(response)=>{

        if (response.success && response.transaction) {
          
          this.transactionTableData=response.transaction.map(transaction=>this.mapTransactionToTableData(transaction))
              this.isLoading=false
              this.totalPages = Math.ceil( this.totalTransactions/this.pagination.pageSize);
                    
            } else {
                console.error('Failed to fetch wallet transactions:', response);
            }
        
      },
      error:(err)=>{
        console.error('Error loading transaction:', err);
       
      }
    })
  }

  mapTransactionToTableData(transaction:Transaction):any{
    return{
      _id: transaction._id.toString().slice(18),
      createdAt:transaction.createdAt,
      amount:transaction.amount,
      purpose:transaction.purpose,
      transactionType:transaction.transactionType

    }
  }

   toggleRechargeInput():void {
      this.showRechargeInput = !this.showRechargeInput;
      if (!this.showRechargeInput) {
        this.amountToAdd = 0; 
      }
  }

  onAddMoney(): void {
    if (!this.amountToAdd || this.amountToAdd < 10) {
    alert("Please enter a valid amount (₹10 or more)");
    return;
  }

  this.walletService.rechargeWallet(this.amountToAdd).subscribe({
    next: (res) => {
      if (res.success && res.checkoutUrl) {
        window.location.href = res.checkoutUrl; 
      } else {
        alert(res.message || "Something went wrong!");
      }
    },
    error: (err) => {
      console.error("Recharge error", err);
      alert("Error initiating wallet recharge.");
    }
  });
  }

  onPageChange(page: number): void {
    this.pagination.page = page;
    this.fetchTransactions();
  }

  
  onSearchChange(searchTerm: string): void {
    this.searchSubject.next(searchTerm);
  }


  applyFilters():void{
    this.pagination.page=1
    this.countFilteredTransactions();
    this.fetchTransactions();
    
  }

  resetFilters(){
    this.pagination.filter = {};
    this.pagination.page = 1;
    this.countAllTransactions()
    this.fetchTransactions();
  }

  countFilteredTransactions():void {
    this.transactionService.countTransactions(this.pagination.filter).subscribe(count =>{
      if(count){
        this.totalTransactions=count.count
        this.totalPages=Math.ceil(this.totalTransactions/this.pagination.pageSize)
      }
    }) 
  }

    countAllTransactions(): void {
    this.transactionService.countTransactions().subscribe(count => {
      if (count) {
        this.totalTransactions = count.count;
        this.totalPages = Math.ceil(this.totalTransactions / this.pagination.pageSize);
      }
    });
  }
  
}
