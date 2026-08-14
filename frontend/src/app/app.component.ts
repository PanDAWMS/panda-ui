import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './core/layout/header/header.component';
import { FooterComponent } from './core/layout/footer/footer.component';
import { MessageBufferService } from './core/services/message-buffer.service';
import { SidePanelComponent } from './core/layout/side-panel/side-panel.component';
import { SidePanelService } from './core/layout/side-panel/side-panel.service';
import { MatSidenavModule } from '@angular/material/sidenav';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MatSidenavModule, RouterOutlet, HeaderComponent, FooterComponent, SidePanelComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  private messageBuffer = inject(MessageBufferService);
  panelService = inject(SidePanelService);
  title = 'PanDA UI';

  ngOnInit(): void {
    // flush message notifications if any
    setTimeout(() => {
      this.messageBuffer.flush();
    }, 100);
  }
}
