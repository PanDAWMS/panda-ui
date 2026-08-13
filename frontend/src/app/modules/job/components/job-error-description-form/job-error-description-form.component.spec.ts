import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentRef } from '@angular/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { JobErrorDescriptionFormComponent } from './job-error-description-form.component';
import { ErrorDescription } from '../../error-description.model';
import { OptionObject } from '../../../../core/models/option.model';
import { LoggingService } from '../../../../core/services/logging.service';

describe('JobErrorDescriptionFormComponent', () => {
  let component: JobErrorDescriptionFormComponent;
  let componentRef: ComponentRef<JobErrorDescriptionFormComponent>;
  let fixture: ComponentFixture<JobErrorDescriptionFormComponent>;

  const mockCategories: OptionObject[] = [
    { value: 1, label: 'Category A' },
    { value: 2, label: 'Category B' },
  ];

  const mockComponents: OptionObject[] = [
    { value: 'Core', label: 'Core' },
    { value: 'Network', label: 'Network' },
  ];

  const mockComponentCodesMap = new Map<string, Set<number>>([['Core', new Set([100, 101])]]);

  const mockExistingItem: ErrorDescription = {
    id: 42n,
    component: 'Core',
    code: 100,
    acronym: 'ERR_CORE',
    diagnostics: 'Diagnostic info long enough',
    description: 'A detailed description of the error that exceeds twenty chars',
    category: 1,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobErrorDescriptionFormComponent],
      providers: [
        {
          provide: LoggingService,
          useValue: {
            forContext: (): { debug: () => void; error: () => void; info: () => void; warn: () => void } => ({
              debug: vi.fn(),
              error: vi.fn(),
              warn: vi.fn(),
              info: vi.fn(),
            }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(JobErrorDescriptionFormComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    // Set initial signal inputs
    componentRef.setInput('categories', mockCategories);
    componentRef.setInput('components', mockComponents);
    componentRef.setInput('componentCodesMap', mockComponentCodesMap);
    componentRef.setInput('selectedItem', null);

    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create and initialize an empty form in create mode', () => {
    expect(component).toBeTruthy();
    expect(component.form).toBeDefined();
    expect(component.form.enabled).toBe(true);
    expect(component.form.value).toEqual({
      component: null,
      code: null,
      acronym: null,
      diagnostics: null,
      description: null,
      category: null,
    });
  });

  describe('Create vs Edit Mode', () => {
    it('should patch form values and disable component & code when selectedItem is set (Edit mode)', () => {
      componentRef.setInput('selectedItem', mockExistingItem);
      fixture.detectChanges();

      expect(component.form.getRawValue()).toEqual({
        component: 'Core',
        code: 100,
        acronym: 'ERR_CORE',
        diagnostics: 'Diagnostic info long enough',
        description: 'A detailed description of the error that exceeds twenty chars',
        category: 1,
      });

      expect(component.form.get('component')?.disabled).toBe(true);
      expect(component.form.get('code')?.disabled).toBe(true);
      expect(component.form.get('acronym')?.enabled).toBe(true);
    });

    it('should reset and enable form when selectedItem becomes null (Create mode)', () => {
      // First put into edit mode
      componentRef.setInput('selectedItem', mockExistingItem);
      fixture.detectChanges();

      // Switch back to create mode
      componentRef.setInput('selectedItem', null);
      fixture.detectChanges();

      expect(component.form.enabled).toBe(true);
      expect(component.form.get('component')?.value).toBe(null);
      expect(component.form.get('code')?.value).toBe(null);
    });
  });

  describe('Custom Validation: duplicateComponentCodeValidator', () => {
    it('should trigger duplicate error when component and code combination exists in Create mode', () => {
      component.form.patchValue({
        component: 'Core',
        code: 100,
      });

      expect(component.form.hasError('duplicate')).toBe(true);
    });

    it('should pass validation when component and code combination is unique in Create mode', () => {
      component.form.patchValue({
        component: 'Core',
        code: 999,
      });

      expect(component.form.hasError('duplicate')).toBe(false);
    });

    it('should ignore duplicate check when editing existing item (Edit mode)', () => {
      componentRef.setInput('selectedItem', mockExistingItem);
      fixture.detectChanges();

      // Core:100 is in the map, but because selectedItem has an ID, duplicate validator returns null
      expect(component.form.hasError('duplicate')).toBe(false);
    });
  });

  describe('Form Actions', () => {
    it('should emit cancelEdit and reset form on cancel', () => {
      const cancelSpy = vi.spyOn(component.cancelEdit, 'emit');

      component.form.patchValue({ acronym: 'TEST_ACRONYM' });
      component.onCancel();

      expect(cancelSpy).toHaveBeenCalledOnce();
      expect(component.form.get('acronym')?.value).toBe(null);
    });

    it('should mark form as touched and not emit save if form is invalid on submit', () => {
      const saveSpy = vi.spyOn(component.save, 'emit');

      component.submit();

      expect(component.form.invalid).toBe(true);
      expect(component.form.touched).toBe(true);
      expect(saveSpy).not.toHaveBeenCalled();
    });

    it('should emit save with correct data when valid in Create mode', () => {
      const saveSpy = vi.spyOn(component.save, 'emit');

      component.form.patchValue({
        component: 'Network',
        code: 200,
        acronym: 'NET_ERR',
        diagnostics: 'Network diagnostics details',
        description: 'Detailed description for network error that exceeds 20 characters',
        category: 2,
      });

      expect(component.form.valid).toBe(true);

      component.submit();

      expect(saveSpy).toHaveBeenCalledWith({
        id: null,
        component: 'Network',
        code: 200,
        acronym: 'NET_ERR',
        diagnostics: 'Network diagnostics details',
        description: 'Detailed description for network error that exceeds 20 characters',
        category: 2,
      });
      expect(component.submitted).toBe(true);
    });

    it('should emit save retaining existing ID when valid in Edit mode', () => {
      componentRef.setInput('selectedItem', mockExistingItem);
      fixture.detectChanges();

      const saveSpy = vi.spyOn(component.save, 'emit');

      component.form.patchValue({
        description: 'Updated description that is still longer than 20 characters',
      });

      expect(component.form.valid).toBe(true);

      component.submit();

      expect(saveSpy).toHaveBeenCalledWith({
        id: 42n,
        component: 'Core',
        code: 100,
        acronym: 'ERR_CORE',
        diagnostics: 'Diagnostic info long enough',
        description: 'Updated description that is still longer than 20 characters',
        category: 1,
      });
    });
  });
});
