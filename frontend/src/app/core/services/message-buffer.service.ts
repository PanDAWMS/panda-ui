import { inject, Injectable } from '@angular/core';
import { MessageService, ToastMessageOptions } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class MessageBufferService {
  // Buffer messages if the UI is not ready yet, then flush them all
  private messageService = inject(MessageService);
  private buffer: ToastMessageOptions[] = [];
  private isUiInit = false;

  add(msg: ToastMessageOptions): void {
    if (this.isUiInit) {
      this.messageService.add(msg);
    } else {
      this.buffer.push(msg);
    }
  }

  flush(): void {
    this.isUiInit = true;
    this.buffer.forEach((msg: ToastMessageOptions) => {
      this.messageService.add(msg);
    });
    this.buffer = [];
  }
}
