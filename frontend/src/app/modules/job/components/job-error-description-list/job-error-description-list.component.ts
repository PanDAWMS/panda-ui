import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MultiSelectModule } from 'primeng/multiselect';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { ErrorDescription } from '../../../../core/models/error-description.model';
import { ApiService } from '../../../../core/services/api.service';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { OptionObject } from '../../../../core/models/option.model';
import { DialogModule } from 'primeng/dialog';
import { JobErrorDescriptionFormComponent } from '../job-error-description-form/job-error-description-form.component';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TagModule } from 'primeng/tag';
import { JobErrorCategoriesService } from '../../../../core/services/job-error-categories.service';
import { JobErrorCategory } from '../../../../core/models/job-error-category.model';
import { LoggingService } from '../../../../core/services/logging.service';

@Component({
  selector: 'app-job-error-description-list',
  imports: [
    AsyncPipe,
    ButtonModule,
    ConfirmDialogModule,
    DialogModule,
    FormsModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    MultiSelectModule,
    TableModule,
    TagModule,
    JobErrorDescriptionFormComponent,
  ],
  providers: [ConfirmationService, MessageService],
  standalone: true,
  templateUrl: './job-error-description-list.component.html',
  styleUrl: './job-error-description-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobErrorDescriptionListComponent implements OnInit {
  private api = inject(ApiService);
  private confirmDialogService = inject(ConfirmationService);
  private jobErrorCategoriesService = inject(JobErrorCategoriesService);
  private log = inject(LoggingService).forContext('JobErrorDescriptionListComponent');
  private jobErrorDescriptionsSubject = new BehaviorSubject<ErrorDescription[]>([]);

  categories: JobErrorCategory[] | null = null;
  categoryOptions: OptionObject[] | undefined = undefined;
  componentOptions: OptionObject[] | undefined = undefined;
  componentCodeMap: Map<string, Set<number>> = new Map<string, Set<number>>();
  isDialogOpen = false;
  jobErrorDescriptions$ = this.jobErrorDescriptionsSubject.asObservable();
  selectedItem: ErrorDescription | null = null;

  ngOnInit(): void {
    forkJoin({
      categories: this.jobErrorCategoriesService.getJobErrorCategories(),
      descriptions: this.getJobErrorDescriptions(),
    }).subscribe(({ categories, descriptions }) => {
      this.categories = categories;
      this.categoryOptions = categories.map((cat: JobErrorCategory) => ({ label: cat.name, value: cat.id }));

      // add category names to descriptions
      descriptions.forEach((desc) => {
        desc.categoryName = this.getJobErrorCategoryName(desc.category);
        desc.categoryColor = this.getJobErrorCategoryColor(desc.category);
      });
      // update the BehaviorSubject with fetched data
      this.jobErrorDescriptionsSubject.next(descriptions);
      // fetch unique component values for filtering
      const uniqueComponents = Array.from(new Set(descriptions.map((desc) => desc.component)));
      // map to {label, value} objects for MultiSelect
      this.componentOptions = uniqueComponents.map((comp) => ({ label: comp, value: comp }));
      // build component to codes map for validation in the form
      this.componentCodeMap = descriptions.reduce((map, { component, code }) => {
        if (!map.has(component)) {
          map.set(component, new Set<number>());
        }
        map.get(component)?.add(code);
        return map;
      }, new Map<string, Set<number>>());
    });
  }

  getJobErrorCategoryName(cat: number): string {
    const category = this.categories?.find((c) => c.id === cat);
    if (category) {
      return category.name;
    }
    return 'Unknown';
  }

  getJobErrorCategoryColor(cat: number): string {
    const category = this.categories?.find((c) => c.id === cat);
    if (category) {
      return category.color || 'gray';
    }
    return 'gray';
  }

  getJobErrorDescriptions(): Observable<ErrorDescription[]> {
    return this.api.get<ErrorDescription[]>('job/error-description');
  }

  onMultiSelectFilterChange(selected: OptionObject[], filterCallback: (v: (string | number)[] | null) => void): void {
    if (!selected || selected.length === 0) {
      filterCallback(null); // clear filter
      return;
    }
    // convert [{label, value}, …] → Array of values before passing to filter
    const values = selected.map((opt) => opt.value);
    filterCallback(values);
  }

  onCreate(): void {
    this.selectedItem = null;
    this.isDialogOpen = true;
  }

  onEdit(item: ErrorDescription): void {
    this.log.debug('Selected item for edit:', item);
    this.selectedItem = item;
    this.isDialogOpen = true;
  }

  confirmDelete(event: Event, item: ErrorDescription): void {
    this.log.debug('Confirm delete triggered');
    this.confirmDialogService.confirm({
      target: event.target as EventTarget,
      header: 'Confirm Deletion',
      message: 'Are you sure you want to delete this error description?',
      icon: 'pi pi-exclamation-triangle',
      closable: true,
      closeOnEscape: true,
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
      },
      acceptButtonProps: {
        label: 'Delete',
        severity: 'danger',
      },
      accept: () => {
        if (item) {
          this.log.debug('Confirmed deletion for item:', item);
          this.onDelete(item);
        }
      },
    });
  }

  onDelete(item: ErrorDescription): void {
    if (!item.id) {
      return;
    }
    this.api.delete('job/error-description', item.id).subscribe(() => {
      // update the local list reactively
      const currentItems = this.jobErrorDescriptionsSubject.value;
      this.jobErrorDescriptionsSubject.next(currentItems.filter((i) => i.id !== item.id));
      this.log.debug('Deleted item with id:', item.id);
    });
  }

  onSave(item: ErrorDescription): void {
    const mode: string = item.id ? 'edit' : 'create';
    if (mode === 'create') {
      this.api.post<ErrorDescription>('job/error-description', item).subscribe({
        next: (res) => {
          this.log.debug('Item saved:', item);
          const newItem = { ...item, id: res.id };
          // update the local list reactively
          const currentItems = this.jobErrorDescriptionsSubject.value;
          this.jobErrorDescriptionsSubject.next([...currentItems, newItem]);
          // close and reset dialog
          this.isDialogOpen = false;
          this.selectedItem = null;
        },
        error: (err) => {
          this.log.error('Error saving item:', err);
        },
      });
    } else if (mode === 'edit') {
      this.api.patch<ErrorDescription>('job/error-description', item.id!, item).subscribe({
        next: (res) => {
          this.log.debug('Item updated:', item, res);
          const updatedItem = { ...item };
          // update the local list reactively
          const currentItems = this.jobErrorDescriptionsSubject.value.filter((i) => i.id !== item.id);
          this.jobErrorDescriptionsSubject.next([...currentItems, updatedItem]);
          // close and reset dialog
          this.isDialogOpen = false;
          this.selectedItem = null;
        },
        error: (err) => {
          this.log.error('Error saving item:', err);
        },
      });
    }
  }
}
