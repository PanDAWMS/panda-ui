import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilterToolbarComponent } from './filter-toolbar.component';
import { ActivatedRoute, Router } from '@angular/router';
import { MatMenuTrigger } from '@angular/material/menu';
import { QuickTimePreset } from '../../search.model';
import { describe, beforeEach, it, expect, vi } from 'vitest';

describe('FilterToolbarComponent', () => {
  let component: FilterToolbarComponent;
  let fixture: ComponentFixture<FilterToolbarComponent>;

  let mockRouter: { navigate: ReturnType<typeof vi.fn> };
  let mockActivatedRoute: { snapshot: { queryParams: Record<string, any> } };
  let mockMenuTrigger: { closeMenu: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockRouter = {
      navigate: vi.fn(),
    };

    mockActivatedRoute = {
      snapshot: { queryParams: {} },
    };

    mockMenuTrigger = {
      closeMenu: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [FilterToolbarComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FilterToolbarComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Initialization & Form Setup', () => {
    it('should initialize form with default config preset when no route query params or initialParams are present', () => {
      fixture.detectChanges();

      expect(component['filterForm'].value).toEqual({
        timePreset: '24h',
        customHours: null,
        customDays: null,
        dateFrom: null,
        dateTo: null,
      });
      expect(component['timeLabel']()).toBe('Last 24 hours');
    });

    it('should initialize form based on URL queryParams over initialParams', () => {
      mockActivatedRoute.snapshot.queryParams = { hours: '6' };
      fixture.componentRef.setInput('initialParams', { hours: 12 });

      fixture.detectChanges();

      expect(component['filterForm'].value.timePreset).toBe('6h');
      expect(component['filterForm'].value.customHours).toBe(6);
      expect(component['customHoursControl'].value).toBe(6);
      expect(component['timeLabel']()).toBe('Last 6 hours');
    });

    it('should set preset to custom when date_from or date_to exists in URL queryParams', () => {
      mockActivatedRoute.snapshot.queryParams = {
        date_from: '2026-01-01',
        date_to: '2026-01-05',
      };

      fixture.detectChanges();

      expect(component['filterForm'].value.timePreset).toBe('custom');
      expect(component['filterForm'].value.dateFrom).toBe('2026-01-01');
      expect(component['filterForm'].value.dateTo).toBe('2026-01-05');
    });

    it('should enforce maxHoursAllowed and maxDaysAllowed validators when provided in config', () => {
      fixture.componentRef.setInput('config', {
        fields: [],
        time: { defaultPreset: '24h', maxHoursAllowed: 48, maxDaysAllowed: 30 },
      });

      fixture.detectChanges();

      component['customHoursControl'].setValue(50);
      expect(component['customHoursControl'].invalid).toBe(true);

      component['customHoursControl'].setValue(24);
      expect(component['customHoursControl'].valid).toBe(true);

      component['customDaysControl'].setValue(31);
      expect(component['customDaysControl'].invalid).toBe(true);
    });
  });

  describe('Preset Selection & Actions', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should update form and close menu when selectPreset is called', () => {
      const applySpy = vi.fn();
      component.applyFilters.subscribe(applySpy);

      component.selectPreset('7d' as QuickTimePreset, mockMenuTrigger as unknown as MatMenuTrigger);

      expect(component['filterForm'].value.timePreset).toBe('7d');
      expect(component['filterForm'].value.customHours).toBeNull();
      expect(mockMenuTrigger.closeMenu).toHaveBeenCalled();
      expect(applySpy).toHaveBeenCalledWith({
        hours: null,
        days: 7,
        date_from: null,
        date_to: null,
      });
    });

    it('should apply custom hours when valid', () => {
      component['customHoursControl'].setValue(12);

      component.applyCustomHours(mockMenuTrigger as unknown as MatMenuTrigger);

      expect(component['filterForm'].value.timePreset).toBe('12h');
      expect(component['filterForm'].value.customHours).toBe(12);
      expect(mockMenuTrigger.closeMenu).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith([], {
        relativeTo: mockActivatedRoute,
        queryParams: { hours: 12, days: null, date_from: null, date_to: null },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    });

    it('should not apply custom hours if control is invalid or empty', () => {
      component['customHoursControl'].setValue(0); // min(1) fails

      component.applyCustomHours(mockMenuTrigger as unknown as MatMenuTrigger);

      expect(component['filterForm'].value.timePreset).toBe('24h');
      expect(mockMenuTrigger.closeMenu).not.toHaveBeenCalled();
    });

    it('should apply custom days when valid', () => {
      component['customDaysControl'].setValue(14);

      component.applyCustomDays(mockMenuTrigger as unknown as MatMenuTrigger);

      expect(component['filterForm'].value.timePreset).toBe('14d');
      expect(component['filterForm'].value.customDays).toBe(14);
      expect(mockMenuTrigger.closeMenu).toHaveBeenCalled();
    });

    it('should apply custom date range', () => {
      component['filterForm'].patchValue({
        dateFrom: new Date('2026-03-01T00:00:00Z'),
        dateTo: new Date('2026-03-10T00:00:00Z'),
      });

      component.applyCustomRange(mockMenuTrigger as unknown as MatMenuTrigger);

      expect(component['filterForm'].value.timePreset).toBe('custom');
      expect(mockMenuTrigger.closeMenu).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith([], {
        relativeTo: mockActivatedRoute,
        queryParams: {
          hours: null,
          days: null,
          date_from: '2026-03-01',
          date_to: '2026-03-10',
        },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    });
  });

  describe('Reset & Label Formatting', () => {
    it('should reset filters to default config preset', () => {
      fixture.componentRef.setInput('config', {
        fields: [],
        time: { defaultPreset: '7d' },
      });
      fixture.detectChanges();

      // Modify form state first
      component['filterForm'].patchValue({ timePreset: 'custom', customHours: 5 });

      component.resetFilters();

      expect(component['filterForm'].value.timePreset).toBe('7d');
      expect(component['filterForm'].value.customHours).toBeNull();
      expect(component['timeLabel']()).toBe('Last 7 days');
    });

    it('should display "Time Range" as fallback label when no preset or custom value matches', () => {
      fixture.detectChanges();

      component['filterForm'].patchValue({
        timePreset: 'unknown_preset',
        customHours: null,
        customDays: null,
      });

      component['updateTimeLabel']();

      expect(component['timeLabel']()).toBe('Time Range');
    });
  });
});
