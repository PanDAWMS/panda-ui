import { inject, Injectable, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { SocketService, StreamEvent } from '../../../../core/services/socket.service';
import { ApiService } from '../../../../core/services/api.service';
import { LoggingService } from '../../../../core/services/logging.service';

export interface ToolUsage {
  name: string;
  status: string;
  result?: unknown;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  statusText?: string;
  toolsUsed: ToolUsage[];
}

@Injectable({
  providedIn: 'root',
})
export class ChatStreamService {
  private chatSocket = inject(SocketService);
  private api = inject(ApiService);
  private log = inject(LoggingService).forContext('ChatStreamService');

  messages = signal<ChatMessage[]>([]);
  isGenerating = signal<boolean>(false);

  private wsSubscription?: Subscription;
  private currentAssistantMessageId?: string;

  async sendMessage(prompt: string): Promise<void> {
    if (this.isGenerating()) {
      this.log.warn('Generation already in progress');
      return;
    }
    const userMsgId = this.api.generateUUID();
    const assistantMsgId = this.api.generateUUID();
    this.currentAssistantMessageId = assistantMsgId;

    // instantly push user message and blank assistant message
    this.messages.update((prev) => [
      ...prev,
      { id: userMsgId, sender: 'user', content: prompt, toolsUsed: [] },
      {
        id: assistantMsgId,
        sender: 'assistant',
        content: '',
        statusText: 'Connecting to WebSocket...',
        toolsUsed: [],
      },
    ]);

    this.isGenerating.set(true);

    try {
      // connect to websocket endpoint
      const stream$ = await this.chatSocket.connect('aide/chat');

      // listen to incoming frames over websocket
      if (!this.wsSubscription) {
        this.wsSubscription = stream$.subscribe({
          next: (event: StreamEvent) => {
            if (this.currentAssistantMessageId) {
              this.handleStreamEvent(this.currentAssistantMessageId, event);
            }

            if (event.type === 'done') {
              this.isGenerating.set(false);
            }
          },
          error: (err) => {
            this.log.error('[WebSocket Error]:', err);

            if (this.currentAssistantMessageId) {
              this.patchAssistantMessage(this.currentAssistantMessageId, (msg) => ({
                ...msg,
                statusText: undefined,
                content: msg.content + '\n[Error: WebSocket connection lost]',
              }));
            }

            this.isGenerating.set(false);
          },
        });
      }

      // dispatch the prompt frame over the open socket connection
      this.chatSocket.sendMessage({
        action: 'send_message',
        message: prompt,
      });
    } catch (err) {
      this.log.error('[WebSocket setup failed]:', err);
      this.patchAssistantMessage(assistantMsgId, (msg) => ({
        ...msg,
        statusText: undefined,
        content: '\n[Error: Could not establish WebSocket connection]',
      }));
      this.isGenerating.set(false);
    }
  }

  stopGeneration(): void {
    if (this.isGenerating()) {
      // Send cancellation signal directly over the socket if desired
      try {
        this.chatSocket.sendMessage({ action: 'cancel' });
      } catch (e) {
        // Socket might already be closed
      }
      this.isGenerating.set(false);
    }
  }

  private handleStreamEvent(messageId: string, event: StreamEvent): void {
    this.patchAssistantMessage(messageId, (msg) => {
      switch (event.type) {
        case 'status':
          this.log.debug(`Status update: ${event.content}`);
          return { ...msg, statusText: event.content };

        case 'token':
          return {
            ...msg,
            statusText: undefined,
            content: msg.content + (event.content || ''),
          };

        case 'done':
          return { ...msg, statusText: undefined };

        default:
          return msg;
      }
    });
  }

  private patchAssistantMessage(id: string, updateFn: (msg: ChatMessage) => ChatMessage): void {
    this.messages.update((prev) => prev.map((msg) => (msg.id === id ? updateFn(msg) : msg)));
  }
}
