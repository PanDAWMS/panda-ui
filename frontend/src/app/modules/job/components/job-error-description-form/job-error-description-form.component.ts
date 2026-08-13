import { ChangeDetectionStrategy, Component, effect, EventEmitter, inject, input, Output } from '@angular/core';
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
import { ErrorDescription } from '../../error-description.model';
import { OptionObject } from '../../../../core/models/option.model';
import { LoggingService } from '../../../../core/services/logging.service';

@Component({
  selector: 'app-job-error-description-form',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  templateUrl: './job-error-description-form.component.html',
  styleUrl: './job-error-description-form.component.scss',
})
export class JobErrorDescriptionFormComponent {
  readonly categories = input<OptionObject[] | undefined>();
  readonly components = input<OptionObject[] | undefined>();
  readonly componentCodesMap = input<Map<string, Set<number>>>(new Map());
  readonly selectedItem = input<ErrorDescription | null>(null);

  @Output() readonly save = new EventEmitter<ErrorDescription>();
  @Output() readonly cancelEdit = new EventEmitter<void>();

  private log = inject(LoggingService).forContext('JobErrorDescriptionFormComponent');
  private fb: FormBuilder = inject(FormBuilder);

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

  submitted = false;
  readonly form: FormGroup = this.fb.group(
    {
      component: ['', [Validators.required]],
      code: [null, [Validators.required, Validators.min(0), Validators.max(10000)]],
      acronym: ['', [Validators.pattern(/^[A-Za-z_]{5,50}$/)]],
      diagnostics: ['', [Validators.minLength(10), Validators.maxLength(200)]],
      description: ['', [Validators.minLength(20), Validators.maxLength(1000)]],
      category: [null, []],
    },
    { validators: (group) => this.duplicateComponentCodeValidator(group) },
  );

  constructor() {
    // Automatically re-run whenever selectedItem signal changes
    effect(() => {
      const currentItem = this.selectedItem();

      if (currentItem && currentItem.id !== null) {
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
