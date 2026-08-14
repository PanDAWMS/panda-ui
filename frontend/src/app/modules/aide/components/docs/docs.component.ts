import { Component, effect, inject, signal } from '@angular/core';
import { SidePanelService } from '../../../../core/layout/side-panel/side-panel.service';
import { DocsService } from './docs.service';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-docs',
  imports: [MatExpansionModule],
  templateUrl: './docs.component.html',
  styleUrl: './docs.component.scss',
})
export class DocsComponent {
  private docsService = inject(DocsService);
  protected panelService = inject(SidePanelService);

  readonly pageContext = this.docsService.currentPageContext;
  readonly globalTopics = this.docsService.globalTopics;

  readonly isGlobalOpen = signal<boolean>(true);

  constructor() {
    // smooth scroll when an anchor is activated
    effect(() => {
      const anchorId = this.docsService.activeAnchor();
      const isOpen = this.panelService.isOpen();
      const isDocsTab = this.panelService.activeTab() === 'docs';

      if (isOpen && isDocsTab && anchorId) {
        setTimeout(() => {
          const el = document.getElementById(`help-topic-${anchorId}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });

            // Visual ring/flash indicator
            el.classList.add('ring-2', 'ring-indigo-500', 'bg-indigo-50/50');
            setTimeout(() => {
              el.classList.remove('ring-2', 'ring-indigo-500', 'bg-indigo-50/50');
            }, 2000);
          }
        }, 150);
      }
    });
  }

  toggleGlobalAccordion(): void {
    this.isGlobalOpen.update((open) => !open);
  }
}
