import { Component, inject } from '@angular/core';
import { NavBarComponent } from "../../shared/nav-bar/nav-bar.component";
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectPhoneNumber, selectUsername } from '../../../store/auth/auth.reducer';
import { TableData, DataTableComponent, TableColumn } from '../../shared/data-table/data-table.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-service-details',
  imports: [NavBarComponent, DataTableComponent, CommonModule],
  templateUrl: './service-details.component.html',
  styleUrl: './service-details.component.scss'
})
export class ServiceDetailsComponent {
private _store = inject(Store)
username$!:Observable<string | null>
phoneNumber$!:Observable<string | null>
isLoading = true
error!: string | null;

serviceTableColumns: TableColumn[] = [
    { header: 'Types of services', key: 'serviceName', type: 'text', width: '70%' },
    { header: 'Description', key: 'description', type: 'text', width: '70%' },
    { header: '', key: 'book', type: 'button', buttonText: 'Book', buttonClass: 'btn-primary', width: '30%' }
  ];
  
  // Table data
  serviceTableData: TableData[] = [];

ngOnInit(){
this.username$=this._store.select(selectUsername)
this.phoneNumber$=this._store.select(selectPhoneNumber)
}

bookSubService(event:{action:string, item:TableData }):void{

}
}
