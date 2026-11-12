import {
  AfterViewInit,
  Component,
  computed,
  inject,
  OnInit,
  signal,
  Signal,
  ViewChild,
  WritableSignal,
} from '@angular/core';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { CommonModule, DatePipe } from '@angular/common';
import { DurationPipe } from '../../../../shared/pipes/duration.pipe';
import { FilterToolbarComponent } from '../../../search/components/filter-toolbar/filter-toolbar.component';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { ProgressBarSegmentedComponent } from '../../../../shared/components/progress-bar-segmented/progress-bar-segmented.component';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { DocsService } from '../../../aide/components/docs/docs.service';
import { LoggingService } from '../../../../core/services/logging.service';
import { FilterParams, FilterToolbarConfig } from '../../../search/search.model';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, finalize } from 'rxjs';
import { StatusCount } from '../../../../shared/models/status.model';
import { TaskService } from '../../task.service';
import { TASK_STATUS_OPTIONS, TASK_TYPE_OPTIONS, TaskItem } from '../../task.model';
import { DOCS_TASK } from '../../task.docs';
import { map } from 'rxjs/operators';
import { BreakAtPipe } from '../../../../shared/pipes/breakAt.pipe';

@Component({
  selector: 'app-task-list',
  imports: [
    CommonModule,
    DurationPipe,
    MatSidenavModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    BadgeComponent,
    FilterToolbarComponent,
    ProgressBarSegmentedComponent,
    RouterOutlet,
    RouterLink,
    BreakAtPipe,
  ],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss',
})
export class TaskListComponent implements OnInit, AfterViewInit {
  private docsService = inject(DocsService);
  private log = inject(LoggingService).forContext('TaskListComponent');
  private router: Router = inject(Router);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private taskService: TaskService = inject(TaskService);

  isLoading: WritableSignal<boolean> = signal<boolean>(true);

  protected readonly Math: Math = Math;

  idParamName: string = 'jeditaskid';
  displayedColumns: string[] = ['task', 'username', 'status', 'files', 'progress', 'created', 'duration'];
  dataSource: MatTableDataSource<TaskItem> = new MatTableDataSource<TaskItem>();
  totalCount: number = 0;
  pageSize: number = 20;
  pageIndex: number = 0;

  currentSort: string = `-${this.idParamName}`;

  // Filter config
  filterConfig: FilterToolbarConfig = {
    time: {
      enabled: true,
      defaultPreset: '24h',
      maxDaysAllowed: 10 * 360,
    },
    fields: [
      {
        key: 'tasktype',
        label: 'Type',
        type: 'select',
        options: TASK_TYPE_OPTIONS,
        multiple: true,
      },
      {
        key: 'status',
        label: 'Status',
        type: 'select',
        options: TASK_STATUS_OPTIONS,
        multiple: true,
      },
      {
        key: 'taskname',
        label: 'Task name',
        type: 'text',
        maxLength: 256,
      },
      {
        key: 'username',
        label: 'User',
        type: 'text',
        maxLength: 64,
      },
    ],
  };
  currentFilterParams: FilterParams = {};

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('drawer') drawer!: MatDrawer;

  // Track router navigation events to drive drawer state reactivity
  private currentUrl: Signal<string | undefined> = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.url),
    ),
  );

  // activeTaskId signal
  activeTaskId: Signal<number | null> = computed((): number | null => {
    this.currentUrl();
    const childRoute = this.route.firstChild;
    const id = childRoute?.snapshot.paramMap.get('id');
    return id ? +id : null;
  });

  // Drawer opens automatically when child route /workflows/:id is active
  isDrawerOpen: Signal<boolean> = computed((): boolean => {
    this.currentUrl(); // Trigger reactivity on navigation change
    return this.route.firstChild !== null;
  });

  ngOnInit(): void {
    this.docsService.setPageContext(DOCS_TASK);
    // react to changes in URL from outside (direct link from top bar)
    this.route.queryParams.subscribe((params) => {
      const { page, page_size, ordering, ...filters } = params;
      this.currentFilterParams = filters as FilterParams;
      // Reset pagination when filters change
      this.pageIndex = 0;
      if (this.paginator) {
        this.paginator.pageIndex = 0;
      }
      // Restore sorting if provided, otherwise use default
      this.currentSort = ordering ?? `-${this.idParamName}`;
      this.loadData();
    });
  }

  ngAfterViewInit(): void {
    if (this.sort) {
      this.sort.sortChange.subscribe((sortState: Sort) => {
        this.handleSortChange(sortState);
      });
    }
  }

  private cleanParams(params: FilterParams): Record<string, any> {
    const cleaned: Record<string, any> = {};
    if (!params) return cleaned;
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        cleaned[key] = value;
      }
    });
    return cleaned;
  }

  loadData(): void {
    this.isLoading.set(true);

    // build query params for an API call
    const activeFilters = this.cleanParams(this.currentFilterParams);
    const queryParams = {
      page: this.pageIndex + 1,
      page_size: this.pageSize,
      ordering: this.currentSort,
      ...activeFilters,
    };
    this.log.debug(`Params: ${JSON.stringify(queryParams)}`);

    // Call WorkflowService using 1-based page numbers for DRF
    this.taskService
      .getTasks(queryParams)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe((response) => {
        this.dataSource.data = response.results ?? [];
        this.totalCount = response.count ?? 0;
        this.isLoading.set(false);
        this.log.debug(`Loaded ${this.totalCount} tasks`);
      });
  }

  onRefresh(): void {
    this.loadData();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadData();
  }

  // Row click navigates to child route /workflows/panel/:id
  onRowClick(workflow: TaskItem): void {
    this.router.navigate(['panel', workflow.jeditaskid], { relativeTo: this.route, queryParamsHandling: 'preserve' });
  }

  // Closing drawer navigates back to base route /workflows
  closeDetails(): void {
    this.router.navigate(['/tasks'], { queryParamsHandling: 'preserve' });
  }

  onDrawerClosed(): void {
    this.closeDetails();
  }

  getFileStatusCounts(row: TaskItem): StatusCount[] {
    if (!row.files_total) return [];
    return [
      { status: 'ready', count: row.files_total - row.files_finished - row.files_failed },
      { status: 'done', count: row.files_finished },
      { status: 'failed', count: row.files_failed },
    ];
  }

  onApplyFilters(params: FilterParams): void {
    this.currentFilterParams = params;
    this.pageIndex = 0;
    if (this.paginator) {
      this.paginator.pageIndex = this.pageIndex;
    }
    this.loadData();
  }

  private handleSortChange(sortState: Sort): void {
    const totalPages: number = Math.ceil(this.totalCount / this.pageSize);

    if (totalPages > 1) {
      this.pageIndex = 0;
      if (this.paginator) {
        this.paginator.pageIndex = 0;
      }

      if (!sortState.active || sortState.direction === '') {
        this.currentSort = `-${this.idParamName}`;
      } else {
        const prefix: string = sortState.direction === 'desc' ? '-' : '';
        this.currentSort = `${prefix}${sortState.active}`;
      }
      this.loadData();
    } else {
      if (this.dataSource) {
        this.dataSource.sort = this.sort;
      }
    }
  }
}
