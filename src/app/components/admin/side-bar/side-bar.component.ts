import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

interface SidebarItem {
  label: string;
  route: string;
  icon?: string; // For future use with icons
  children?: SidebarItem[];
}

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss']
})
export class SidebarComponent {
  title: string = 'Admin Panel';

  menuItems: SidebarItem[] = [
    { label: 'Dashboard', route: '/admin-dashboard', icon:'dashboard' },
    { label: 'Users', route: '/user-management', icon:'persons' },
    { label: 'Partners', route: '/partner-management',icon:'group' },
    { label: 'Services', route: '/service-management',icon: 'category' },
    { label: 'Sub-Services', route: '/sub-service-management',icon: 'build' },
    { label: 'Activities', route: '/activities',icon: 'task_alt'},
    { label: 'Revenue', route: '/admin-wallet',icon: 'money' },
  ];
}