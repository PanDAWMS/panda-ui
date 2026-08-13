import { inject, Injectable } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { take } from 'rxjs/operators';
import { AppConfigService } from './app-config.service';
import { AuthService } from './auth.service';
import { LoggingService } from './logging.service';

export interface StreamEvent {
  type: 'status' | 'tool_start' | 'tool_end' | 'token' | 'done' | 'error';
  content?: string;
  tool?: string;
  result?: unknown;
}

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private config = inject(AppConfigService);
  private authService = inject(AuthService);
  private log = inject(LoggingService).forContext('WebSocketService');

  private socket$?: WebSocketSubject<any>;

  private get wsBaseUrl(): string {
    const apiUrl = new URL(this.config.apiUrl);
    const protocol = apiUrl.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${apiUrl.host}/`;
  }

  async connect(endpoint: string): Promise<Observable<StreamEvent>> {
    if (this.socket$ && !this.socket$.closed) {
      return this.socket$.asObservable() as Observable<StreamEvent>;
    }

    // use active auth token to connect to the websocket endpoint
    const token = await firstValueFrom(this.authService.token$.pipe(take(1)));
    const socketUrl = `${this.wsBaseUrl}ws/${endpoint}/`;

    this.socket$ = webSocket<StreamEvent>({
      url: socketUrl,
      deserializer: (msg) => JSON.parse(msg.data),
      serializer: (msg) => JSON.stringify(msg),
      openObserver: {
        next: () => this.log.debug('Connected to websocket at', socketUrl),
      },
      closeObserver: {
        next: () => this.log.debug('Connection closed'),
      },
    });

    return this.socket$.asObservable() as Observable<StreamEvent>;
  }

  sendMessage(payload: { action: string; message?: string; conversation_id?: string }): void {
    if (!this.socket$ || this.socket$.closed) {
      throw new Error('WebSocket is not connected');
    }
    this.socket$.next(payload);
  }

  disconnect(): void {
    if (this.socket$) {
      this.socket$.complete();
    }
  }
}
