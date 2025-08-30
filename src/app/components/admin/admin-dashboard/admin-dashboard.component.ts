import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../side-bar/side-bar.component';
import { NavBarComponent } from '../../shared/nav-bar/nav-bar.component';
import { Store } from '@ngrx/store';
import { DashboardService } from '../../../services/dashboard.service';
import { selectUsername, selectPhoneNumber } from '../../../store/auth/auth.reducer';
import { AdminDashboardResponseDTO } from '../../../models/dashboard.model';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions, ChartType } from 'chart.js';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [SidebarComponent, CommonModule, NavBarComponent, BaseChartDirective],
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

  // Pie Chart
  public pieChartOptions: ChartOptions<'pie'> = { responsive: true, maintainAspectRatio: false };
  public pieChartData: ChartData<'pie', number[], string> = {
    labels: [],
    datasets: [{ data: [] }]
  };
  public pieChartLegend = true;
  public pieChartPlugins: any[] = [];

  // Line Chart
  public lineChartData: ChartData<'line', (number | null)[], string> = {
    labels: [],
    datasets: [{ data: [], label: 'Revenue' }]
  };
  public lineChartOptions: ChartOptions<'line'> = { responsive: true };
  public lineChartLegend = true;
  // public lineChartType: ChartType = 'line';
  public lineChartType: 'line' = 'line';

  public lineChartPlugins: any[] = [];

  private subscription?: Subscription;

  ngOnInit(): void {
    this.username$ = this._store.select(selectUsername);
    this.phoneNumber$ = this._store.select(selectPhoneNumber);

    this.dashboard$ = this._dashboardService.getAdminDashboard().pipe(
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
      })
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

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
