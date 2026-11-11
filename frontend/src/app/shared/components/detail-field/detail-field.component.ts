import { Component, input, InputSignal } from '@angular/core';
import { BreakAtPipe } from '../../pipes/breakAt.pipe';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-detail-field',
  standalone: true,
  imports: [BreakAtPipe, MatTooltipModule],
  templateUrl: './detail-field.component.html',
  styleUrl: './detail-field.component.scss',
})
export class DetailFieldComponent {
  readonly label = input.required<string>();
  readonly value = input<string | number | null | undefined>();
  readonly link: InputSignal<string | undefined> = input<string | undefined>();
  readonly tooltip: InputSignal<string | undefined> = input<string | undefined>();
  readonly className: InputSignal<string | undefined> = input<string | undefined>();

  isNonEmptyString(val: unknown): val is string {
    return typeof val === 'string' && val.trim().length > 0;
  }
}
