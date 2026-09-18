import { Component, computed, input, InputSignal, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-badge',
  imports: [CommonModule],
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.scss',
})
export class BadgeComponent {
  label: InputSignal<string> = input.required<string>();
  // either soft or solid
  mode: InputSignal<'solid' | 'soft' | 'text'> = input<'solid' | 'soft' | 'text'>('solid');
  // status-based colors
  status: InputSignal<string | null> = input<string | null>(null);
  // custom colors
  backgroundColor: InputSignal<string | null> = input<string | null>(null);
  textColor: InputSignal<string | null> = input<string | null>(null);

  statusClass: Signal<string> = computed(() => {
    const st: string | null = this.status();
    const md = this.mode();
    return st ? `status-${st.toLowerCase()}-${md.toLowerCase()}` : '';
  });

  customStyles: Signal<Record<string, string>> = computed((): Record<string, string> => {
    // If status is present, let CSS classes handle colors
    if (this.status()) return {};

    const styles: Record<string, string> = {};
    if (this.backgroundColor()) styles['background-color'] = this.backgroundColor()!;
    if (this.textColor()) styles['color'] = this.textColor()!;
    return styles;
  });
}
