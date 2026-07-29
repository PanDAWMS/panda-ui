import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { LoginComponent } from '../../../modules/auth/components/login/login.component';
import { AppConfigService } from '../../services/app-config.service';
import { SearchOmniComponent } from '../../../modules/search/components/omni/omni.component';
import { MenuItem } from '../../models/menu-item';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    SearchOmniComponent,
    LoginComponent,
  ],
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
