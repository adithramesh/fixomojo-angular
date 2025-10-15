import { Component, OnInit, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { PartnerDashboardResponseDTO } from '../../../models/dashboard.model';
import { DashboardService } from '../../../services/dashboard.service';
import { selectPhoneNumber, selectUsername } from '../../../store/auth/auth.reducer';
import { PartnerSideBarComponent } from '../partner-side-bar/partner-side-bar.component';
import { CommonModule } from '@angular/common';
import { NavBarComponent } from '../../shared/nav-bar/nav-bar.component';
import { LocationService } from '../../../services/location.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-partner-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    PartnerSideBarComponent,
    NavBarComponent,
    MatIconModule
  ],
  templateUrl: './partner-dashboard.component.html',
  styleUrl: './partner-dashboard.component.scss'
})
export class PartnerDashboardComponent implements OnInit {
  private store = inject(Store);
  private locationService = inject(LocationService);
  private dashboardService = inject(DashboardService);

  phoneNumber$!: Observable<string | null>;
  username$!: Observable<string | null>;
  dashboardData: PartnerDashboardResponseDTO = {
    totalRevenue: 0,
    totalBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0
  };
  isLoading = true;
  error: string | null = null;
  savedLocation = '';

  ngOnInit() {
    this.username$ = this.store.select(selectUsername);
    this.phoneNumber$ = this.store.select(selectPhoneNumber);
    this.getLocation();
    this.loadDashboardData();
  }

  private getLocation(): void {
    this.locationService.getSavedLocation().subscribe(location => {
      if (location) {
        this.savedLocation = location;
      }
    });
  }

  private loadDashboardData(): void {
    this.isLoading = true;
    this.dashboardService.getPartnerDashboard().subscribe({
      next: (data) => {
        this.dashboardData = {
          totalRevenue: data.totalRevenue ?? 0,
          totalBookings: data.totalBookings ?? 0,
          completedBookings: data.completedBookings ?? 0,
          cancelledBookings: data.cancelledBookings ?? 0
        };
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Failed to load dashboard data.';
        this.isLoading = false;
      }
    });
  }
}
