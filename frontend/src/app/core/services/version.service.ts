import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class VersionService {
  readonly version = signal<string>('dev');

  setVersion(v: string): void {
    this.version.set(v);
    console.log('VersionSignal being set to:', v);
  }
}
