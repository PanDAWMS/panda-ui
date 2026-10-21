import {
  Component,
  input,
  output,
  OnInit,
  OnDestroy,
  signal,
  inject,
  computed,
  ViewChildren,
  QueryList,
  ElementRef,
} from '@angular/core';
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
import {
  COMPARISON_OPERATOR_LABELS,
  ComparisonOperator,
  FilterFieldConfig,
  FilterParams,
  FilterToolbarConfig,
  QUICK_TIME_PRESETS,
  QuickTimePreset,
} from '../../search.model';
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

  @ViewChildren('chipMenuTrigger') chipMenuTriggers!: QueryList<MatMenuTrigger>;
  @ViewChildren('filterInput') filterInputs!: QueryList<ElementRef<HTMLInputElement>>;

  protected readonly quickPresets = QUICK_TIME_PRESETS.filter((p) => p.value !== 'custom');
  protected filterForm!: FormGroup;
  protected customHoursControl!: FormControl<number | null>;
  protected customDaysControl!: FormControl<number | null>;

  protected timeLabel = signal<string>('');
  protected activeFieldKeys = signal<string[]>([]);

  // Computes unselected dynamic fields for the '+' menu
  protected availableFieldConfigs = computed(() => {
    const active = new Set(this.activeFieldKeys());
    return (this.config().fields || []).filter((f) => !active.has(f.key));
  });

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

    const formGroupControls: Record<string, any> = {
      timePreset: [preset],
      customHours: [hours],
      customDays: [days],
      dateFrom: [dateFrom],
      dateTo: [dateTo],
    };

    // Form setup for Dynamic Fields
    const initialActiveKeys: string[] = [];
    (this.config().fields || []).forEach((field) => {
      if (field.type === 'select') {
        const isMulti = field.multiple ?? true;
        const defaultOp: ComparisonOperator = isMulti ? 'in' : 'eq';

        let detectedOp: ComparisonOperator = defaultOp;
        let val: any = field.defaultValue ?? (isMulti ? [] : null);

        const inKey = `${field.key}[in]`;
        const ninKey = `${field.key}[nin]`;
        const eqKey = `${field.key}[eq]`;

        if (urlParams[inKey] != null || init[inKey] != null) {
          detectedOp = 'in';
          const raw = urlParams[inKey] ?? init[inKey];
          val = typeof raw === 'string' ? raw.split(',') : raw;
        } else if (urlParams[ninKey] != null || init[ninKey] != null) {
          detectedOp = 'nin';
          const raw = urlParams[ninKey] ?? init[ninKey];
          val = typeof raw === 'string' ? raw.split(',') : raw;
        } else if (urlParams[eqKey] != null || init[eqKey] != null) {
          detectedOp = 'eq';
          val = urlParams[eqKey] ?? init[eqKey];
        }

        formGroupControls[`${field.key}_op`] = [detectedOp];
        formGroupControls[`${field.key}_val`] = [val];

        if ((Array.isArray(val) && val.length > 0) || (!Array.isArray(val) && val != null)) {
          initialActiveKeys.push(field.key);
        }
      } else if (field.type === 'number') {
        const ops: ComparisonOperator[] = ['eq', 'gt', 'gte', 'lt', 'lte'];
        let detectedOp: ComparisonOperator = 'eq';
        let singleVal: number | null = field.defaultValue ?? null;
        let minVal: number | null = null;
        let maxVal: number | null = null;

        const gteKey = `${field.key}[gte]`;
        const lteKey = `${field.key}[lte]`;

        if (
          (urlParams[gteKey] != null || init[gteKey] != null) &&
          (urlParams[lteKey] != null || init[lteKey] != null)
        ) {
          detectedOp = 'between';
          minVal = Number(urlParams[gteKey] ?? init[gteKey]);
          maxVal = Number(urlParams[lteKey] ?? init[lteKey]);
        } else {
          for (const op of ops) {
            const paramKey = `${field.key}[${op}]`;
            if (urlParams[paramKey] != null || init[paramKey] != null) {
              detectedOp = op;
              singleVal = Number(urlParams[paramKey] ?? init[paramKey]);
              break;
            }
          }
        }

        formGroupControls[`${field.key}_op`] = [detectedOp];
        formGroupControls[`${field.key}_val`] = [singleVal];
        formGroupControls[`${field.key}_min`] = [minVal];
        formGroupControls[`${field.key}_max`] = [maxVal];

        if (singleVal != null || minVal != null || maxVal != null) {
          initialActiveKeys.push(field.key);
        }
      } else if (field.type === 'text') {
        const eqKey = `${field.key}[eq]`;
        const inKey = `${field.key}[in]`;
        const wcKey = `${field.key}[wc]`;

        let detectedOp: ComparisonOperator = 'eq';
        let val: string | null = field.defaultValue ?? null;

        if (urlParams[inKey] != null || init[inKey] != null) {
          detectedOp = 'in';
          val = urlParams[inKey] ?? init[inKey];
        } else if (urlParams[eqKey] != null || init[eqKey] != null) {
          detectedOp = 'eq';
          val = urlParams[eqKey] ?? init[eqKey];
        } else if (urlParams[wcKey] != null || init[wcKey] != null) {
          detectedOp = 'wc';
          val = urlParams[wcKey] ?? init[eqKey];
        }

        formGroupControls[`${field.key}_op`] = [detectedOp];
        formGroupControls[`${field.key}_val`] = [val];

        if (val) {
          initialActiveKeys.push(field.key);
        }
      }
    });

    this.filterForm = this.fb.group(formGroupControls);
    this.activeFieldKeys.set(initialActiveKeys);

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

  getFieldConfig(key: string): FilterFieldConfig | undefined {
    return (this.config().fields || []).find((f) => f.key === key);
  }

  addFilter(key: string): void {
    if (!this.activeFieldKeys().includes(key)) {
      this.activeFieldKeys.update((keys) => [...keys, key]);

      // open menu automatically
      setTimeout(() => {
        const lastChipMenuTrigger = this.chipMenuTriggers.last;
        if (lastChipMenuTrigger) {
          lastChipMenuTrigger.openMenu();

          const field = this.getFieldConfig(key);
          if (field?.type === 'text' || field?.type === 'number') {
            setTimeout(() => {
              const lastInput = this.filterInputs.last;
              lastInput?.nativeElement?.focus();
            }, 50);
          }
        }
      });
    }
  }

  removeFilter(key: string, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.activeFieldKeys.update((keys) => keys.filter((k) => k !== key));

    const field = this.getFieldConfig(key);
    if (field?.type === 'select') {
      const isMulti = field.multiple ?? true;
      this.filterForm.patchValue({
        [`${key}_op`]: isMulti ? 'in' : 'eq',
        [`${key}_val`]: isMulti ? [] : null,
      });
    } else if (field?.type === 'number') {
      this.filterForm.patchValue({
        [`${key}_op`]: 'eq',
        [`${key}_val`]: null,
        [`${key}_min`]: null,
        [`${key}_max`]: null,
      });
    } else if (field?.type === 'text') {
      this.filterForm.patchValue({
        [`${key}_op`]: 'eq',
        [`${key}_val`]: null,
      });
    }

    setTimeout(() => {
      this.emitFilters();
    });
  }

  applyFieldFilter(trigger?: MatMenuTrigger): void {
    trigger?.closeMenu();
    this.emitFilters();
  }

  clearSelectFilter(key: string, trigger?: MatMenuTrigger): void {
    const field = this.getFieldConfig(key);
    const isMulti = field?.multiple ?? true;
    this.filterForm.patchValue({
      [`${key}_op`]: isMulti ? 'in' : 'eq',
      [`${key}_val`]: isMulti ? [] : null,
    });
  }

  clearNumericField(key: string, trigger?: MatMenuTrigger): void {
    this.filterForm.patchValue({
      [`${key}_op`]: 'eq',
      [`${key}_val`]: null,
      [`${key}_min`]: null,
      [`${key}_max`]: null,
    });
  }

  clearTextField(key: string, trigger?: MatMenuTrigger): void {
    this.filterForm.patchValue({
      [`${key}_op`]: 'eq',
      [`${key}_val`]: null,
    });
  }

  getSelectChipLabel(field: FilterFieldConfig): string {
    const op = this.filterForm.get(`${field.key}_op`)?.value || 'in';
    const val = this.filterForm.get(`${field.key}_val`)?.value;
    const options = field.options || [];

    const prefix = op === 'nin' ? 'Not In' : field.label;

    if (!val || (Array.isArray(val) && val.length === 0)) {
      return field.label;
    }

    if (Array.isArray(val)) {
      if (val.length === 1) {
        const match = options.find((o) => o.value === val[0]);
        return match ? `${prefix}: ${match.label}` : `${prefix}: 1 selected`;
      }
      return `${prefix}: ${val.length} selected`;
    }

    const match = options.find((o) => o.value === val);
    return match ? `${prefix}: ${match.label}` : `${prefix}: ${val}`;
  }

  onNumericOpChange(key: string): void {
    this.filterForm.patchValue({
      [`${key}_val`]: null,
      [`${key}_min`]: null,
      [`${key}_max`]: null,
    });
  }

  getNumericChipLabel(field: FilterFieldConfig): string {
    const op = this.filterForm.get(`${field.key}_op`)?.value;
    const val = this.filterForm.get(`${field.key}_val`)?.value;
    const min = this.filterForm.get(`${field.key}_min`)?.value;
    const max = this.filterForm.get(`${field.key}_max`)?.value;

    if (op === 'between' && (min != null || max != null)) {
      return `${field.label}: ${min ?? '-\u221E'} to ${max ?? '\u221E'}`;
    }

    if (val != null) {
      return `${field.label} ${COMPARISON_OPERATOR_LABELS[op as ComparisonOperator] || ''} ${val}`;
    }

    return field.label;
  }

  getTextChipLabel(field: FilterFieldConfig): string {
    const op = this.filterForm.get(`${field.key}_op`)?.value || 'eq';
    const val = this.filterForm.get(`${field.key}_val`)?.value;

    if (val) {
      return op === 'in' ? `${field.label} in (${val})` : `${field.label}: "${val}"`;
    }

    return field.label;
  }

  isFilterActive(key: string): boolean {
    const val = this.filterForm.get(`${key}_val`)?.value;
    if (Array.isArray(val)) return val.length > 0;

    const numMin = this.filterForm.get(`${key}_min`)?.value;
    const numMax = this.filterForm.get(`${key}_max`)?.value;
    return val != null || numMin != null || numMax != null;
  }

  resetFilters(): void {
    const defaultPreset: QuickTimePreset = this.config()?.time?.defaultPreset || '24h';
    const resetValues: Record<string, any> = {
      timePreset: defaultPreset,
      customHours: null,
      customDays: null,
      dateFrom: null,
      dateTo: null,
    };

    (this.config().fields || []).forEach((field) => {
      if (field.type === 'select') {
        const isMulti = field.multiple ?? true;
        resetValues[`${field.key}_op`] = isMulti ? 'in' : 'eq';
        resetValues[`${field.key}_val`] = isMulti ? [] : null;
      } else if (field.type === 'number') {
        resetValues[`${field.key}_op`] = 'eq';
        resetValues[`${field.key}_val`] = null;
        resetValues[`${field.key}_min`] = null;
        resetValues[`${field.key}_max`] = null;
      } else if (field.type === 'text') {
        resetValues[`${field.key}_op`] = 'eq';
        resetValues[`${field.key}_val`] = null;
      }
    });

    this.activeFieldKeys.set([]);
    this.customHoursControl.reset(null, { emitEvent: false });
    this.customDaysControl.reset(null, { emitEvent: false });
    this.filterForm.reset(resetValues);
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

    const activeKeys = new Set(this.activeFieldKeys());
    const supportedOps: ComparisonOperator[] = ['eq', 'gt', 'gte', 'lt', 'lte', 'in', 'nin'];

    (this.config().fields || []).forEach((field) => {
      // Clear out suffix query params if field chip is inactive
      if (!activeKeys.has(field.key)) {
        supportedOps.forEach((op) => {
          queryParams[`${field.key}[${op}]`] = null;
        });
        return;
      }

      if (field.type === 'select') {
        const op: ComparisonOperator = formVal[`${field.key}_op`] || 'in';
        const val = formVal[`${field.key}_val`];

        supportedOps.forEach((o) => (queryParams[`${field.key}[${o}]`] = null));

        if (Array.isArray(val) && val.length > 0) {
          queryParams[`${field.key}[${op}]`] = val.join(',');
        } else if (!Array.isArray(val) && val != null) {
          queryParams[`${field.key}[${op}]`] = val;
        }
      } else if (field.type === 'number') {
        const op: ComparisonOperator = formVal[`${field.key}_op`];
        const val = formVal[`${field.key}_val`];
        const min = formVal[`${field.key}_min`];
        const max = formVal[`${field.key}_max`];

        supportedOps.forEach((o) => (queryParams[`${field.key}[${o}]`] = null));

        if (op === 'between') {
          if (min != null) queryParams[`${field.key}[gte]`] = min;
          if (max != null) queryParams[`${field.key}[lte]`] = max;
        } else if (val != null) {
          queryParams[`${field.key}[${op}]`] = val;
        }
      } else if (field.type === 'text') {
        const op: ComparisonOperator = formVal[`${field.key}_op`] || 'eq';
        const val = formVal[`${field.key}_val`];

        supportedOps.forEach((o) => (queryParams[`${field.key}[${o}]`] = null));

        if (val) {
          queryParams[`${field.key}[${op}]`] = val;
        }
      }
    });

    // update URL and chip label
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      // queryParamsHandling: 'merge',
      replaceUrl: true,
    });
    this.updateTimeLabel();

    // emit params to parent
    this.applyFilters.emit(queryParams);
  }
}
