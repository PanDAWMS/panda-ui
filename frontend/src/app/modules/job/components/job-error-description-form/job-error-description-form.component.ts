import { ChangeDetectionStrategy, Component, inject, input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { EventEmitter, Output } from '@angular/core';
import { ErrorDescription } from '../../../../core/models/error-description.model';
import { SelectModule } from 'primeng/select';
import { OptionObject } from '../../../../core/models/option.model';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageModule } from 'primeng/message';
import { LoggingService } from '../../../../core/services/logging.service';

@Component({
  selector: 'app-job-error-description-form',
  imports: [
    ButtonModule,
    InputNumberModule,
    InputTextModule,
    MessageModule,
    ReactiveFormsModule,
    SelectModule,
    TextareaModule,
  ],
  templateUrl: './job-error-description-form.component.html',
  styleUrl: './job-error-description-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobErrorDescriptionFormComponent implements OnInit, OnChanges {
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

  ngOnInit(): void {
    this.form = this.fb.group({
      component: ['', [Validators.required]],
      code: [null, [Validators.required, Validators.pattern(/^[0-9)]{1,5}$/)]],
      acronym: ['', [Validators.pattern(/^[A-Z)]{5,20}$/)]],
      diagnostics: ['', [Validators.maxLength(200), Validators.minLength(20)]],
      description: ['', [Validators.maxLength(500), Validators.minLength(50)]],
      category: [null, []],
    });
    this.form.setValidators(this.duplicateComponentCodeValidator);
  }

  duplicateComponentCodeValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    if (this.selectedItem()?.id) {
      return null;
    } // skip validation in edit mode
    const component = group.get('component')?.value?.value;
    const code = group.get('code')?.value;
    if (!component || !code) {
      return null;
    }
    return this.componentCodesMap().get(component)?.has(code) ? { duplicate: true } : null;
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.form) {
      return;
    }
    if (changes['selectedItem']) {
      const currentItem = this.selectedItem();
      if (currentItem && currentItem.id) {
        // edit mode
        this.form.patchValue({
          component: currentItem.component ? { label: currentItem.component, value: currentItem.component } : '',
          code: currentItem.code,
          acronym: currentItem.acronym,
          diagnostics: currentItem.diagnostics,
          description: currentItem.description,
          category:
            currentItem.category && this.categories()
              ? this.categories()?.find((cat) => cat.value === currentItem!.category) || null
              : null,
        });
        this.form.get('component')?.disable();
        this.form.get('code')?.disable();
      } else {
        // create mode
        this.form.reset();
        this.form.enable();
      }
    }
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
    const formData = this.form.getRawValue();
    const currentItem = this.selectedItem();
    const newItem = {
      id: currentItem?.id ? currentItem.id : null,
      component: formData.component?.value,
      code: formData.code,
      acronym: formData.acronym,
      diagnostics: formData.diagnostics,
      description: formData.description,
      category: formData.category?.id ? formData.category.id : 0,
    };
    this.submitted = true;
    this.log.debug('Form submitted:', newItem);
    this.save.emit({ ...newItem });
  }
}
