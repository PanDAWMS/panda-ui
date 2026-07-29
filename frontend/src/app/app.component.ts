import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './core/layout/header/header.component';
import { FooterComponent } from './core/layout/footer/footer.component';
import { MessageBufferService } from './core/services/message-buffer.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  private messageBuffer = inject(MessageBufferService);
  title = 'PanDA UI';

  ngOnInit(): void {
    // flush message notifications if any
    setTimeout(() => {
      this.messageBuffer.flush();
    }, 100);
  }
}
