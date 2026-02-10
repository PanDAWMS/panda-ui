import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MenuItem } from 'primeng/api';
import { BadgeModule } from 'primeng/badge';
import { InputTextModule } from 'primeng/inputtext';
import { Ripple } from 'primeng/ripple';
import { Menubar } from 'primeng/menubar';
import { LoginComponent } from '../../../modules/auth/components/login/login.component';
import { AppConfigService } from '../../services/app-config.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, Menubar, BadgeModule, InputTextModule, Ripple, CommonModule, LoginComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit {
  private readonly config = inject(AppConfigService);
  items: MenuItem[] | undefined;
  name = 'PanDA UI';

  private get vo(): string {
    return this.config.get('vo') as string;
  }
  // keep header thin; LoginComponent handles auth UI
  ngOnInit(): void {
    this.name = `${this.vo} ${this.name}`;
    this.items = [
      // {
      //   label: 'Tasks',
      //   items: [{ label: 'All' }, { label: 'Analysis' }, { label: 'Production' }],
      // },
      {
        label: 'Jobs',
        items: [
          // { label: 'All' },
          { label: 'Error descriptions', routerLink: '/job-error-descriptions' },
        ],
      },
    ];
  }
}
