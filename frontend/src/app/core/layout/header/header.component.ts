import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MenuItem } from 'primeng/api';
import { BadgeModule } from 'primeng/badge';
import { InputTextModule } from 'primeng/inputtext';
import { Ripple } from 'primeng/ripple';
import { Menubar } from 'primeng/menubar';
import { LoginComponent } from '../../../modules/auth/components/login/login.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, Menubar, BadgeModule, InputTextModule, Ripple, CommonModule, LoginComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  items: MenuItem[] | undefined;

  // keep header thin; LoginComponent handles auth UI
  ngOnInit() {
    this.items = [
      {
        label: 'Tasks',
        items: [{ label: 'All' }, { label: 'Analysis' }, { label: 'Production' }],
      },
      {
        label: 'Jobs',
        items: [{ label: 'All' }, { label: 'Error descriptions', routerLink: '/job-error-descriptions' }],
      },
    ];
  }
}
