import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../side-bar/side-bar.component';
import { NavBarComponent } from '../../shared/nav-bar/nav-bar.component';
import { Store } from '@ngrx/store';
import { DashboardService } from '../../../services/dashboard.service';
import { selectUsername, selectPhoneNumber } from '../../../store/auth/auth.reducer';
import { AdminDashboardResponseDTO } from '../../../models/dashboard.model';
import { Observable, Subscription } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [SidebarComponent, CommonModule,FormsModule, NavBarComponent, BaseChartDirective],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  private _store = inject(Store);
  private _dashboardService = inject(DashboardService);

  username$!: Observable<string | null>;
  phoneNumber$!: Observable<string | null>;
  dashboard$!: Observable<AdminDashboardResponseDTO>;

  isLoading = true;
  error: string | null = null;
  private subscription?: Subscription;

  // Filters
  startDate = '';
  endDate = '';
  today: string = new Date().toISOString().split('T')[0];

  // Pie Chart
  public pieChartOptions: ChartOptions<'pie'> = { responsive: true, maintainAspectRatio: false };
  public pieChartData: ChartData<'pie', number[], string> = {
    labels: [],
    datasets: [{ data: [] }]
  };
  public pieChartLegend = true;
  public pieChartPlugins: unknown[] = [];

  // Line Chart
  public lineChartData: ChartData<'line', (number | null)[], string> = {
    labels: [],
    datasets: [{ data: [], label: 'Revenue' }]
  };
  public lineChartOptions: ChartOptions<'line'> = { responsive: true };
  public lineChartLegend = true;
  public lineChartType = 'line' as const;
  public lineChartPlugins: unknown[] = [];

  ngOnInit(): void {
    this.username$ = this._store.select(selectUsername);
    this.phoneNumber$ = this._store.select(selectPhoneNumber);

    this.loadDashboard();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  loadDashboard(startDate?: string, endDate?: string): void {
    this.dashboard$ = this._dashboardService.getAdminDashboard(startDate, endDate).pipe(
      map((data) => {
        this.pieChartData = {
          labels: data.bookingStatusDistribution?.map(i => i.status) ?? [],
          datasets: [{
            data: data.bookingStatusDistribution?.map(i => i.count) ?? [],
            backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#EF5350','#AB47BC']
          }]
        };

        this.lineChartData = {
          labels: data.revenueTrends?.map(i => `Week ${i.week}`) ?? [],
          datasets: [{
            data: data.revenueTrends?.map(i => i.totalRevenue) ?? [],
            label: 'Total Revenue',
            borderColor: '#42A5F5',
            backgroundColor: 'rgba(66, 165, 245, 0.2)',
            fill: true
          }]
        };

        return data;
      }),
       shareReplay(1)
    );

    this.subscription = this.dashboard$.subscribe({
      next: () => {
        this.isLoading = false;
        this.error = null;
      },
      error: (err) => {
        console.error('Failed to load dashboard', err);
        this.isLoading = false;
        this.error = 'Failed to load dashboard';
      }
    });
  }

  applyFilter(): void {
    this.loadDashboard(this.startDate, this.endDate);
  }

  resetFilter(): void {
      this.startDate = '';
      this.endDate = '';
      this.loadDashboard(); // reload without filter
    }

 private formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}-${month}-${year}`;
  }

  get revenueTrendsTitle(): string {
    if (this.startDate && this.endDate) {
      return `Revenue Trends (${this.formatDate(this.startDate)} to ${this.formatDate(this.endDate)})`;
    }
    return 'Revenue Trends (Last 8 Weeks)';
  }

  downloadSalesReportExcel(): void {
    this.dashboard$.subscribe((data) => {
      if (!data) return;

      const rows = [
        ["SALES REPORT SUMMARY"],
        ["Total Revenue", data.totalRevenue],
        ["Total Bookings", data.totalBookings],
        ["Active Partners", data.activePartners],
        ["Total Customers", data.totalCustomers],
        [],
        ["Booking Status Distribution"],
        ...(data.bookingStatusDistribution?.map(b => [b.status, b.count]) || []),
        [],
        ["Revenue Trends (Last 8 Weeks)"],
        ["Week", "Total Revenue"],
        ...(data.revenueTrends?.map(r => [`Week ${r.week}`, r.totalRevenue]) || [])
      ];

      const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(rows);
      const workbook: XLSX.WorkBook = { Sheets: { 'SalesReport': worksheet }, SheetNames: ['SalesReport'] };
      const excelBuffer: ArrayBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer;
      const file: Blob = new Blob([excelBuffer], { type: "application/octet-stream" });
      saveAs(file, `Sales_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    });
  }

  downloadSalesReportPDF(): void {
  this.dashboard$.subscribe((data) => {
    if (!data) return;

    const doc = new jsPDF();

    // Extend type of jsPDF instance with optional lastAutoTable
    const docWithTable = doc as jsPDF & {
      lastAutoTable?: { finalY: number };
    };

    doc.setFontSize(18);
    doc.text('Sales Report Summary', 14, 22);

    // Summary table
    autoTable(doc, {
      startY: 30,
      head: [['Metric', 'Value']],
      body: [
        ['Total Revenue', data.totalRevenue],
        ['Total Bookings', data.totalBookings],
        ['Active Partners', data.activePartners],
        ['Total Customers', data.totalCustomers],
      ],
    });

    // Status table
    autoTable(doc, {
      startY: (docWithTable.lastAutoTable?.finalY ?? 30) + 10,
      head: [['Status', 'Count']],
      body: data.bookingStatusDistribution?.map((b) => [b.status, b.count]) || [],
    });

    // Revenue trends table
    autoTable(doc, {
      startY: (docWithTable.lastAutoTable?.finalY ?? 30) + 10,
      head: [['Week', 'Total Revenue']],
      body: data.revenueTrends?.map((r) => [`Week ${r.week}`, r.totalRevenue]) || [],
    });

    doc.save(`Sales_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  });
}

}
