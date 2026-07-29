import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ErrorDescription } from '../../../../core/models/error-description.model';
import { ApiService } from '../../../../core/services/api.service';
import { OptionObject } from '../../../../core/models/option.model';
import { JobErrorDescriptionFormComponent } from '../job-error-description-form/job-error-description-form.component';
import { JobErrorCategoriesService } from '../../../../core/services/job-error-categories.service';
import { JobErrorCategory } from '../../../../core/models/job-error-category.model';
import { LoggingService } from '../../../../core/services/logging.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-job-error-description-list',
  imports: [
    ReactiveFormsModule,
    JobErrorDescriptionFormComponent,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
  ],
  standalone: true,
  templateUrl: './job-error-description-list.component.html',
  styleUrl: './job-error-description-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobErrorDescriptionListComponent implements OnInit {
  private api = inject(ApiService);
  private dialog = inject(MatDialog);
  private destroyRef = inject(DestroyRef);
  private jobErrorCategoriesService = inject(JobErrorCategoriesService);
  private log = inject(LoggingService).forContext('JobErrorDescriptionListComponent');
  private jobErrorDescriptionsSubject = new BehaviorSubject<ErrorDescription[]>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('formDialog') formDialog!: TemplateRef<unknown>;

  dialogRef?: MatDialogRef<unknown>;
  displayedColumns: string[] = ['component', 'code', 'diagnostics', 'description', 'category', 'actions'];
  dataSource = new MatTableDataSource<ErrorDescription>([]);
  componentFilterCtrl = new FormControl<(string | number)[]>([]);
  codeFilterCtrl = new FormControl<string>('');
  categoryFilterCtrl = new FormControl<(string | number)[]>([]);

  categories: JobErrorCategory[] | null = null;
  categoryOptions: OptionObject[] | undefined = undefined;
  componentOptions: OptionObject[] | undefined = undefined;
  componentCodeMap: Map<string, Set<number>> = new Map<string, Set<number>>();
  isDialogOpen = false;
  selectedItem: ErrorDescription | null = null;
  endpoint: string = 'job/error-description';

  ngOnInit(): void {
    this.dataSource.filterPredicate = (data: ErrorDescription, filterJson: string) => {
      const filters = JSON.parse(filterJson);

      const matchGlobal =
        !filters.global ||
        Object.keys(data).some((key) => {
          const val = data[key as keyof ErrorDescription];
          return val !== null && val !== undefined && String(val).toLowerCase().includes(filters.global.toLowerCase());
        });

      const matchComponent = !filters.component?.length || filters.component.includes(data.component);

      const matchCode = !filters.code || String(data.code).toLowerCase().includes(filters.code.toLowerCase());

      const matchCategory = !filters.category?.length || filters.category.includes(data.category);

      return matchGlobal && matchComponent && matchCode && matchCategory;
    };

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

    // Keep MatTableDataSource in sync with Subject updates
    this.jobErrorDescriptionsSubject.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((descriptions) => {
      this.dataSource.data = descriptions || [];
    });

    // Subscribe to filter control updates
    this.componentFilterCtrl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.updateFilters());

    this.codeFilterCtrl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.updateFilters());

    this.categoryFilterCtrl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.updateFilters());
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

  getCategoryLabel(value?: string | number): string {
    if (value === undefined || value === null) {
      return '';
    }
    const match = this.categoryOptions?.find((opt) => opt.value === value);
    return match?.label ?? '';
  }

  getJobErrorDescriptions(): Observable<ErrorDescription[]> {
    return this.api.get<ErrorDescription[]>(this.endpoint);
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyGlobalFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.updateFilters(filterValue);
  }

  private updateFilters(globalVal?: string): void {
    const currentFilterState = this.dataSource.filter ? JSON.parse(this.dataSource.filter) : {};
    const currentGlobal = globalVal !== undefined ? globalVal : currentFilterState.global || '';

    this.dataSource.filter = JSON.stringify({
      global: currentGlobal,
      component: this.componentFilterCtrl.value || [],
      code: this.codeFilterCtrl.value || '',
      category: this.categoryFilterCtrl.value || [],
    });
  }

  onCreate(): void {
    this.selectedItem = null;
    this.isDialogOpen = true;
    this.openFormDialog();
  }

  onEdit(item: ErrorDescription): void {
    this.log.debug('Selected item for edit:', item);
    this.selectedItem = item;
    this.isDialogOpen = true;
    this.openFormDialog();
  }

  openFormDialog(): void {
    this.dialogRef = this.dialog.open(this.formDialog, {
      width: '60vw',
      maxWidth: '90vw',
      disableClose: false,
    });
  }

  confirmDelete(item: ErrorDescription): void {
    this.log.debug('Confirm delete triggered');
    const isConfirmed = confirm('Are you sure you want to delete this error description?');
    if (isConfirmed) {
      this.log.debug('Confirmed deletion for item:', item);
      this.onDelete(item);
    }
  }

  onDelete(item: ErrorDescription): void {
    if (!item.id) {
      return;
    }
    this.api.delete(this.endpoint, item.id).subscribe(() => {
      // update the local list reactively
      const currentItems = this.jobErrorDescriptionsSubject.value;
      this.jobErrorDescriptionsSubject.next(currentItems.filter((i) => i.id !== item.id));
      this.log.debug('Deleted item with id:', item.id);
    });
  }

  onSave(item: ErrorDescription): void {
    const mode: string = item.id ? 'edit' : 'create';
    // enrich item with display fields
    const enrichCategory = (i: ErrorDescription): ErrorDescription => ({
      ...i,
      categoryName: this.getJobErrorCategoryName(i.category),
      categoryColor: this.getJobErrorCategoryColor(i.category),
    });

    if (mode === 'create') {
      this.api.post<ErrorDescription>(this.endpoint, item).subscribe({
        next: (res) => {
          this.log.debug('Item saved:', item);
          const newItem = enrichCategory({ ...item, id: res.id });
          // update the local list reactively
          const currentItems = this.jobErrorDescriptionsSubject.value;
          this.jobErrorDescriptionsSubject.next([...currentItems, newItem]);
          // close and reset dialog
          this.dialogRef?.close();
          this.isDialogOpen = false;
          this.selectedItem = null;
        },
        error: (err) => {
          this.log.error('Error saving item:', err);
        },
      });
    } else if (mode === 'edit') {
      this.api.patch<ErrorDescription>(this.endpoint, item.id!, item).subscribe({
        next: (res) => {
          this.log.debug('Item updated:', item, res);
          const updatedItem = enrichCategory({ ...item });
          // update the local list reactively
          const currentItems = this.jobErrorDescriptionsSubject.value.filter((i) => i.id !== item.id);
          this.jobErrorDescriptionsSubject.next([...currentItems, updatedItem]);
          // close and reset
          this.dialogRef?.close();
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
