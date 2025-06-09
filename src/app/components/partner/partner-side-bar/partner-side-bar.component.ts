import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { NavBarComponent } from "../../shared/nav-bar/nav-bar.component";

interface SidebarItem {
  label: string;
  route: string;
  icon?: string; // For future use with icons
  children?: SidebarItem[];
}

@Component({
  selector: 'app-partner-side-bar',
  imports: [CommonModule, RouterModule, MatIconModule, NavBarComponent],
  templateUrl: './partner-side-bar.component.html',
  styleUrl: './partner-side-bar.component.scss'
})
export class PartnerSideBarComponent {
title: string = 'Partner Panel';
menuItems: SidebarItem[] = [
    { label: 'Dashboard', route: '/partner-dashboard', icon:'dashboard' },
    { label: 'Location', route: '/location', icon:'location_on' },
    { label: 'Time slots', route: '/time-slots',icon:'schedule' },
    { label: 'Tasks', route: '/tasks',icon: 'task_alt' },
    { label: 'Requests', route: '/service-requests',icon: 'handyman' },
  ];
}
