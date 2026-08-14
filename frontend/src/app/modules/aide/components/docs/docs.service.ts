import { inject, Injectable, Service, signal } from '@angular/core';
import { DocTopic } from './docs.model';
import { LoggingService } from '../../../../core/services/logging.service';
import { PageContext } from '../../../../core/models/page-context';

const DOCS_GLOBAL: DocTopic[] = [
  {
    id: 'authentication',
    title: 'Authentication & API Access',
    content:
      'You can authenticate using Custom API Tokens from your Profile page. Pass tokens in the Authorization header.',
  },
];

@Injectable({ providedIn: 'root' })
export class DocsService {
  private log = inject(LoggingService).forContext('DocsService');

  readonly isOpen = signal<boolean>(false);
  readonly globalTopics = signal<DocTopic[]>(DOCS_GLOBAL);
  readonly activeAnchor = signal<string | null>(null);
  readonly currentPageContext = signal<PageContext | null>(null);

  openDocs(anchorId?: string): void {
    this.isOpen.set(true);
    if (anchorId) {
      this.activeAnchor.set(anchorId);
    }
  }

  closeDocs(): void {
    this.isOpen.set(false);
  }

  toggleDocs(): void {
    this.isOpen.update((open) => !open);
  }

  setPageContext(context: PageContext | null): void {
    this.log.debug('[DocsService] Docs content updated', context);
    this.currentPageContext.set(context);
  }
}
