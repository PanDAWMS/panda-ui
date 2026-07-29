import { ChangeDetectionStrategy, Component, effect, EventEmitter, inject, input, OnInit, Output } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ErrorDescription } from '../../../../core/models/error-description.model';
import { OptionObject } from '../../../../core/models/option.model';
import { LoggingService } from '../../../../core/services/logging.service';

@Component({
  selector: 'app-job-error-description-form',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  templateUrl: './job-error-description-form.component.html',
  styleUrl: './job-error-description-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobErrorDescriptionFormComponent implements OnInit {
  readonly categories = input<OptionObject[] | undefined>();
  readonly components = input<OptionObject[] | undefined>();
  readonly componentCodesMap = input<Map<string, Set<number>>>(new Map());
  readonly selectedItem = input<ErrorDescription | null>(null);
  @Output() readonly save = new EventEmitter<ErrorDescription>();
  @Output() readonly cancelEdit = new EventEmitter<void>();

  form!: FormGroup;
  submitted = false;

  private fb: FormBuilder = inject(FormBuilder);
  private log = inject(LoggingService).forContext('JobErrorDescriptionFormComponent');

  constructor() {
    // Automatically re-run whenever selectedItem signal changes
    effect(() => {
      const currentItem = this.selectedItem();
      if (!this.form) {
        return;
      }

      if (currentItem && currentItem.id) {
        // Edit mode
        this.form.patchValue({
          component: currentItem.component ?? '',
          code: currentItem.code,
          acronym: currentItem.acronym ?? '',
          diagnostics: currentItem.diagnostics ?? '',
          description: currentItem.description ?? '',
          category: currentItem.category ?? null,
        });
        this.form.get('component')?.disable();
        this.form.get('code')?.disable();
      } else {
        // Create mode
        this.form.reset();
        this.form.enable();
      }
    });
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      component: ['', [Validators.required]],
      code: [null, [Validators.required, Validators.min(0), Validators.max(10000)]],
      acronym: ['', [Validators.pattern(/^[A-Za-z_]{5,50}$/)]],
      diagnostics: ['', [Validators.minLength(10), Validators.maxLength(200)]],
      description: ['', [Validators.minLength(20), Validators.maxLength(1000)]],
      category: [null, []],
    });
    this.form.setValidators(this.duplicateComponentCodeValidator);

    // Initial check on load
    const currentItem = this.selectedItem();
    if (currentItem && currentItem.id) {
      this.form.patchValue({
        component: currentItem.component ?? '',
        code: currentItem.code,
        acronym: currentItem.acronym ?? '',
        diagnostics: currentItem.diagnostics ?? '',
        description: currentItem.description ?? '',
        category: currentItem.category ?? null,
      });
      this.form.get('component')?.disable();
      this.form.get('code')?.disable();
    }
  }

  duplicateComponentCodeValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    if (this.selectedItem()?.id) {
      return null;
    }
    const component = group.get('component')?.value;
    const code = group.get('code')?.value;
    if (!component || code === null || code === undefined) {
      return null;
    }
    return this.componentCodesMap().get(component)?.has(Number(code)) ? { duplicate: true } : null;
  };

  onCancel(): void {
    this.form.reset();
    this.cancelEdit.emit();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const formData = this.form.getRawValue(); // gets values even from disabled fields
    const currentItem = this.selectedItem();
    const newItem: ErrorDescription = {
      id: currentItem?.id ? currentItem.id : null,
      component: formData.component,
      code: Number(formData.code),
      acronym: formData.acronym,
      diagnostics: formData.diagnostics,
      description: formData.description,
      category: formData.category ?? 0,
    };
    this.submitted = true;
    this.log.debug('Form submitted:', newItem);
    this.save.emit(newItem);
  }
}
