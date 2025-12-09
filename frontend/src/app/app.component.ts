import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PrimeNG } from 'primeng/config';
import { HeaderComponent } from './core/layout/header/header.component';
import { FooterComponent } from './core/layout/footer/footer.component';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

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
  title = 'frontend';

  private messageService = inject(MessageService);

  ngOnInit(): void {
    // enable PrimeNG ripple effect
    this.primeng.ripple.set(true);

    // --- manual test toast ---
    console.debug('[AppComponent] Sending test message to MessageService');
    this.messageService.add({
      severity: 'info',
      summary: 'Debug Test',
      detail: 'MessageService is working',
      life: 5000,
    });
  }
}
