import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';

import { SidePanelService } from './side-panel.service';
import { ChatComponent } from '../../../modules/aide/components/chat/chat.component';
import { DocsComponent } from '../../../modules/aide/components/docs/docs.component';

@Component({
  selector: 'app-side-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatSidenavModule,
    ChatComponent,
    DocsComponent,
  ],
  templateUrl: './side-panel.component.html',
  styleUrl: './side-panel.component.scss',
})
export class SidePanelComponent {
  panelService = inject(SidePanelService);

  onTabChange(index: number): void {
    this.panelService.activeTab.set(index === 0 ? 'docs' : 'chat');
  }
}
