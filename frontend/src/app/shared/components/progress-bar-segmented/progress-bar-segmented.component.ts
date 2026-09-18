import { Component, computed, input, InputSignal, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeComponent } from '../badge/badge.component';
import { StatusCount } from '../../models/status.model';

@Component({
  selector: 'app-progress-bar-segmented',
  imports: [CommonModule, BadgeComponent],
  templateUrl: './progress-bar-segmented.component.html',
  styleUrl: './progress-bar-segmented.component.scss',
})
export class ProgressBarSegmentedComponent {
  // Array of status breakdowns: e.g. [{ status: 'done', count: 12 }, ...]
  counts: InputSignal<StatusCount[]> = input.required<StatusCount[]>();
  showLegend: InputSignal<boolean | null> = input<boolean | null>(false);
  title: InputSignal<string | null> = input<string | null>('');

  // Total steps for calculating percentage widths
  total: Signal<number> = computed(() => this.counts().reduce((sum, item: StatusCount): number => sum + item.count, 0));
  // filter out 0 count
  countsToShow: Signal<StatusCount[]> = computed(() => this.counts().filter(({ count }) => count > 0));
}
