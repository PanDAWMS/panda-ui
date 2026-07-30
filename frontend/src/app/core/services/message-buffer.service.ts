import { inject, Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

export interface SnackBarMessage {
  message: string;
  action?: string;
  config?: MatSnackBarConfig;
}

@Injectable({
  providedIn: 'root',
})
export class MessageBufferService {
  // Buffer messages if the UI is not ready yet, then flush them all
  private snackBar = inject(MatSnackBar);
  private buffer: SnackBarMessage[] = [];
  private isUiInit = false;

  add(message: string, action = 'Close', config?: MatSnackBarConfig): void {
    const item: SnackBarMessage = { message, action, config };
    if (this.isUiInit) {
      this.openSnackBar(item);
    } else {
      this.buffer.push(item);
    }
  }

  flush(): void {
    this.isUiInit = true;
    this.buffer.forEach((item) => this.openSnackBar(item));
    this.buffer = [];
  }

  private openSnackBar(item: SnackBarMessage): void {
    this.snackBar.open(item.message, item.action, {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      ...item.config,
    });
  }
}
