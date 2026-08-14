import { Injectable, signal, inject } from '@angular/core';
import { AppConfigService } from '../../services/app-config.service';

export type PanelTab = 'docs' | 'chat';

@Injectable({ providedIn: 'root' })
export class SidePanelService {
  private configService = inject(AppConfigService);

  readonly isOpen = signal<boolean>(false);
  readonly activeTab = signal<PanelTab>('docs');

  // Helper signal/getter to check if aide is enabled
  get isAideEnabled(): boolean {
    return this.configService.hasApp('aide');
  }

  togglePanel(tab?: PanelTab): void {
    let targetTab = tab || this.activeTab();

    // Prevent switching to chat if 'aide' isn't in runtime config
    if (targetTab === 'chat' && !this.isAideEnabled) {
      targetTab = 'docs';
    }

    if (tab && this.isOpen() && this.activeTab() === targetTab) {
      this.isOpen.set(false);
    } else {
      this.activeTab.set(targetTab);
      this.isOpen.set(true);
    }
  }
}
