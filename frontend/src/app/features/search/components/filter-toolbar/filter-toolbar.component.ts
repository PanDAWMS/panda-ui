import { Component, input, output, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject } from 'rxjs';
import { FilterParams, FilterToolbarConfig, QUICK_TIME_PRESETS, QuickTimePreset } from '../../search.model';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-filter-toolbar',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule,
  ],
  templateUrl: './filter-toolbar.component.html',
  styleUrls: ['./filter-toolbar.component.scss'],
})
export class FilterToolbarComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  config = input<FilterToolbarConfig>({ fields: [], time: { defaultPreset: '24h' } });
  initialParams = input<FilterParams>({});
  applyFilters = output<FilterParams>();

  protected readonly quickPresets = QUICK_TIME_PRESETS.filter((p) => p.value !== 'custom');
  protected filterForm!: FormGroup;
  protected customHoursControl!: FormControl<number | null>;
  protected customDaysControl!: FormControl<number | null>;

  protected timeLabel = signal<string>('');

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.initForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(): void {
    // Clean up existing subscriptions before rebuilding
    this.destroy$.next();
    const timeConfig = this.config().time;
    const init = this.initialParams();

    // limits -> validators
    const hourValidators = [Validators.min(1)];
    if (timeConfig?.maxHoursAllowed) {
      hourValidators.push(Validators.max(timeConfig.maxHoursAllowed));
    }
    const dayValidators = [Validators.min(1)];
    if (timeConfig?.maxDaysAllowed) {
      dayValidators.push(Validators.max(timeConfig.maxDaysAllowed));
    }
    this.customHoursControl = this.fb.control<number | null>(null, hourValidators);
    this.customDaysControl = this.fb.control<number | null>(null, dayValidators);

    // load and parse params from URL
    const urlParams = this.route.snapshot.queryParams;
    const hours = urlParams['hours'] ? Number(urlParams['hours']) : init.hours ?? null;
    const days = urlParams['days'] ? Number(urlParams['days']) : init.days ?? null;
    const dateFrom = urlParams['date_from'] || init.date_from || null;
    const dateTo = urlParams['date_to'] || init.date_to || null;

    // Determine preset string representation
    let preset: QuickTimePreset = timeConfig.defaultPreset || '24h';
    if (hours) preset = `${hours}h` as QuickTimePreset;
    else if (days) preset = `${days}d` as QuickTimePreset;
    else if (dateFrom || dateTo) preset = 'custom';

    // Sync inputs if explicit hours/days were in URL
    if (hours) this.customHoursControl.setValue(hours, { emitEvent: false });
    if (days) this.customDaysControl.setValue(days, { emitEvent: false });

    this.filterForm = this.fb.group({
      timePreset: [preset],
      customHours: [hours],
      customDays: [days],
      dateFrom: [dateFrom],
      dateTo: [dateTo],
    });

    // Update time limit and emit filters to URL
    this.updateTimeLabel();
    this.emitFilters();
  }

  get activePreset(): string {
    return this.filterForm.get('timePreset')?.value || '';
  }

  selectPreset(preset: QuickTimePreset, trigger?: MatMenuTrigger): void {
    this.filterForm.patchValue({
      timePreset: preset,
      customHours: null,
      customDays: null,
      dateFrom: null,
      dateTo: null,
    });
    this.customHoursControl.reset(null, { emitEvent: false });
    this.customDaysControl.reset(null, { emitEvent: false });
    trigger?.closeMenu();
    this.emitFilters();
  }

  applyCustomHours(trigger?: MatMenuTrigger): void {
    if (this.customHoursControl.invalid || !this.customHoursControl.value) {
      return;
    }
    const hrs = this.customHoursControl.value;
    if (hrs && hrs > 0) {
      this.filterForm.patchValue({
        timePreset: `${hrs}h` as QuickTimePreset,
        customHours: hrs,
        customDays: null,
        dateFrom: null,
        dateTo: null,
      });
    }
    trigger?.closeMenu();
    this.emitFilters();
  }

  applyCustomDays(trigger?: MatMenuTrigger): void {
    if (this.customDaysControl.invalid || !this.customDaysControl.value) {
      return;
    }
    const days = this.customDaysControl.value;
    if (days && days > 0) {
      this.filterForm.patchValue({
        timePreset: `${days}d` as QuickTimePreset,
        customHours: null,
        customDays: days,
        dateFrom: null,
        dateTo: null,
      });
    }
    trigger?.closeMenu();
    this.emitFilters();
  }

  applyCustomRange(trigger?: MatMenuTrigger): void {
    const { dateFrom, dateTo } = this.filterForm.value;
    if (dateFrom || dateTo) {
      this.filterForm.patchValue({
        timePreset: 'custom',
        customHours: null,
        customDays: null,
      });
      this.customHoursControl.reset(null, { emitEvent: false });
      this.customDaysControl.reset(null, { emitEvent: false });
    }
    trigger?.closeMenu();
    this.emitFilters();
  }

  private updateTimeLabel(): void {
    if (!this.filterForm) return;

    const val = this.filterForm.value;
    const preset = val.timePreset;

    if (preset === 'custom') {
      const formatDate = (d: any) =>
        d ? new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '...';

      const from = formatDate(val.dateFrom);
      const to = formatDate(val.dateTo);
      this.timeLabel.set(`${from} – ${to}`);
      return;
    }

    const matchedPreset = QUICK_TIME_PRESETS.find((p) => p.value === preset);
    if (matchedPreset) {
      this.timeLabel.set(matchedPreset.label);
      return;
    }

    if (val.customHours) {
      this.timeLabel.set(`Last ${val.customHours} Hours`);
      return;
    }

    if (val.customDays) {
      this.timeLabel.set(`Last ${val.customDays} Days`);
      return;
    }

    this.timeLabel.set('Time Range');
  }

  resetFilters(): void {
    const defaultPreset: QuickTimePreset = this.config()?.time?.defaultPreset || '24h';
    this.customHoursControl.reset(null, { emitEvent: false });
    this.customDaysControl.reset(null, { emitEvent: false });
    this.filterForm.reset({
      timePreset: defaultPreset,
      customHours: null,
      customDays: null,
      dateFrom: null,
      dateTo: null,
    });
    this.updateTimeLabel();
    this.emitFilters();
  }

  emitFilters(): void {
    // build clean query params
    const formVal = this.filterForm.value;
    const queryParams: FilterParams = {
      hours: formVal.customHours || (formVal.timePreset?.endsWith('h') ? parseInt(formVal.timePreset, 10) : null),
      days: formVal.customDays || (formVal.timePreset?.endsWith('d') ? parseInt(formVal.timePreset, 10) : null),
      date_from: formVal.dateFrom ? new Date(formVal.dateFrom).toISOString().split('T')[0] : null,
      date_to: formVal.dateTo ? new Date(formVal.dateTo).toISOString().split('T')[0] : null,
    };

    // update URL and chip label
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
    this.updateTimeLabel();

    // emit params to parent
    this.applyFilters.emit(queryParams);
  }
}
