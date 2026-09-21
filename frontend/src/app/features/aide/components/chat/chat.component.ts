import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ChatStreamService } from './chat-stream.service';
import { CdkTextareaAutosize, TextFieldModule } from '@angular/cdk/text-field';

@Component({
  selector: 'app-chat',
  imports: [
    CommonModule,
    FormsModule,
    TextFieldModule,
    CdkTextareaAutosize,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent {
  chatService = inject(ChatStreamService);
  userInput = '';

  send(): void {
    if (!this.userInput.trim() || this.chatService.isGenerating()) {
      return;
    }
    const text = this.userInput;
    this.userInput = '';
    this.chatService.sendMessage(text);
  }
}
