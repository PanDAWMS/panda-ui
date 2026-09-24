import { MultiselectOption } from '../../shared/models/option.model';

export type FilterType = 'multiselect' | 'text' | 'number';
export type NumberOperator = 'eq' | 'gt' | 'gte' | 'lt' | 'lte';
export type QuickTimePreset = '1h' | '6h' | '12h' | '24h' | '7d' | '30d' | '90d' | 'custom';

export const QUICK_TIME_PRESETS: { label: string; value: QuickTimePreset }[] = [
  { label: 'Last 1 hour', value: '1h' },
  { label: 'Last 6 hours', value: '6h' },
  { label: 'Last 12 hours', value: '12h' },
  { label: 'Last 24 hours', value: '24h' },
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
  { label: 'Custom range', value: 'custom' },
];

export interface TimeFilterParams {
  hours?: number | null;
  days?: number | null;
  date_from?: string | null;
  date_to?: string | null;
}

export interface TimeFilterConfig {
  defaultPreset?: QuickTimePreset;
  enabled?: boolean;
  maxDaysAllowed?: number;
  maxHoursAllowed?: number;
  minDate?: Date;
  maxDate?: Date;
}

export interface FilterFieldConfig {
  key: string;
  label: string;
  type: FilterType;
  options?: MultiselectOption[];
  placeholder?: string;
  defaultValue?: any;
  min?: number;
  max?: number;
  maxLength?: number;
}

export interface FilterToolbarConfig {
  fields: FilterFieldConfig[];
  time: TimeFilterConfig;
}

export interface FilterParams extends TimeFilterParams {
  [key: string]: string | number | null | undefined;
}
