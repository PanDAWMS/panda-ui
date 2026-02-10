import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PrimeNG } from 'primeng/config';
import { HeaderComponent } from './core/layout/header/header.component';
import { FooterComponent } from './core/layout/footer/footer.component';
import { ToastModule } from 'primeng/toast';
import { MessageBufferService } from './core/services/message-buffer.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ToastModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  private primeng = inject(PrimeNG);
  private messageBuffer = inject(MessageBufferService);
  title = 'PanDA UI';

  ngOnInit(): void {
    // enable PrimeNG ripple effect
    this.primeng.ripple.set(true);
    // flush message notifications if any
    setTimeout(() => {
      this.messageBuffer.flush();
    }, 100);
  }
}
