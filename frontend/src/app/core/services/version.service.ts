import { inject, Injectable, signal } from '@angular/core';
import { LoggingService } from './logging.service';

@Injectable({
  providedIn: 'root',
})
export class VersionService {
  private log = inject(LoggingService).forContext('VersionService');
  readonly version = signal<string>('dev');

  setVersion(v: string): void {
    this.version.set(v);
    this.log.info('Version being set to:', v);
  }
}
