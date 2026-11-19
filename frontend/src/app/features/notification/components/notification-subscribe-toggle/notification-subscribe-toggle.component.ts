import { Component, inject, input, InputSignal, OnInit, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NotificationService } from '../../notification.service';
import { AppConfigService } from '../../../../core/services/app-config.service';

@Component({
  selector: 'app-notification-subscribe-toggle',
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './notification-subscribe-toggle.component.html',
  styleUrl: './notification-subscribe-toggle.component.scss',
})
export class NotificationSubscribeToggleComponent implements OnInit {
  private notificationService = inject(NotificationService);
  private configService = inject(AppConfigService);

  jeditaskid: InputSignal<number> = input.required<number>();

  readonly enabled: boolean = this.configService.hasApp('notification');
  readonly subscribed: WritableSignal<boolean> = signal(false);

  ngOnInit(): void {
    if (!this.enabled) {
      return;
    }
    this.notificationService.listSubscriptions().subscribe((subs) => {
      this.subscribed.set(subs.some((sub) => sub.jeditaskid === this.jeditaskid()));
    });
  }

  toggleSubscription(): void {
    const jeditaskid = this.jeditaskid();
    if (this.subscribed()) {
      this.notificationService.unsubscribe(jeditaskid).subscribe(() => this.subscribed.set(false));
    } else {
      this.notificationService.subscribe(jeditaskid).subscribe(() => this.subscribed.set(true));
    }
  }
}
