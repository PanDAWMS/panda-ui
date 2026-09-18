import { AfterViewInit, Component, computed, inject, OnInit, Signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { ActivatedRoute, NavigationEnd, Router, Event as RouterEvent, RouterOutlet } from '@angular/router';
import { LoggingService } from '../../../../core/services/logging.service';
import { DurationPipe } from '../../../../shared/pipes/duration.pipe';
import { WorkflowItem } from '../../workflow.model';
import { WorkflowService } from '../../workflow.service';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { ProgressBarSegmentedComponent } from '../../../../shared/components/progress-bar-segmented/progress-bar-segmented.component';
import { StatusCount } from '../../../../shared/models/status.model';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { PageContext } from '../../../../shared/models/page-context.model';
import { DocsService } from '../../../aide/components/docs/docs.service';

const DOCS_WORKFLOW: PageContext = {
  pageTitle: 'PanDA Native Workflow',
  topics: [
    {
      id: 'workflow-definition',
      title: 'Workflow Definition',
      content:
        'A workflow is a set of tasks whose relationships are described by a directed acyclic graph (DAG). ' +
        'Each edge is directed from a parent task to a child task, where the child processes output data produced by the parent. ' +
        'A PanDA native workflow runs entirely inside the PanDA server and is described by a single YAML workflow description (WFD) file. ' +
        'The server parses the description, registers the workflow, its steps, and its data in the PanDA database, and drives execution using its workflow engine.',
    },
    {
      id: 'workflow-step',
      title: 'Workflow Step',
      content:
        'A workflow step is a node in the DAG and is defined by an arbitrary step name and a step definition. ' +
        'The step type defaults to prun and can also be workflow for a sub-workflow. ' +
        'A prun step is essentially a prun invocation together with the wiring that identifies its input data. ',
    },
    {
      id: 'workflow-data-availability',
      title: 'Data Availability',
      content:
        'A child step starts when the data it consumes is considered available. ' +
        'By default, the workflow engine waits until the parent step finishes, or until all of the parent output collections are closed and non-empty, so that the child receives the complete input. ' +
        'This behavior can be relaxed with workflow-level options so that child steps can start while their parents are still running.',
    },
  ],
};

@Component({
  selector: 'app-workflow-list',
  standalone: true,
  imports: [
    CommonModule,
    DurationPipe,
    MatSidenavModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    BadgeComponent,
    ProgressBarSegmentedComponent,
    RouterOutlet,
  ],
  templateUrl: './workflow-list.component.html',
  styleUrls: ['./workflow-list.component.scss'],
})
export class WorkflowListComponent implements OnInit, AfterViewInit {
  private docsService = inject(DocsService);
  private log = inject(LoggingService).forContext('WorkflowListComponent');
  private router: Router = inject(Router);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private workflowService: WorkflowService = inject(WorkflowService);

  protected readonly Math: Math = Math;

  displayedColumns: string[] = ['workflow', 'status', 'steps', 'progress', 'created', 'duration'];
  dataSource: MatTableDataSource<WorkflowItem> = new MatTableDataSource<WorkflowItem>();
  totalCount: number = 0;
  pageSize: number = 10;
  pageIndex: number = 0;
  isLoading: boolean = true;
  currentSort: string = '-workflow_id';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('drawer') drawer!: MatDrawer;

  // Track router navigation events to drive drawer state reactivity
  private currentUrl: Signal<RouterEvent | undefined> = toSignal(
    this.router.events.pipe(filter((e: RouterEvent): e is NavigationEnd => e instanceof NavigationEnd)),
  );

  // Replace selectedWorkflow with activeWorkflowId signal
  activeWorkflowId: Signal<number | null> = computed((): number | null => {
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
    this.loadWorkflows();
    this.docsService.setPageContext(DOCS_WORKFLOW);
  }

  ngAfterViewInit(): void {
    // Sort on client side if only 1 page, otherwise reload presorted data from server
    this.sort.sortChange.subscribe((sortState: Sort): void => {
      const totalPages: number = Math.ceil(this.totalCount / this.pageSize);

      if (totalPages > 1) {
        this.pageIndex = 0; // Reset to page 1 on sort change
        if (this.paginator) {
          this.paginator.pageIndex = 0;
        }

        // Convert MatSort direction ('asc'/'desc') to Django DRF query string format
        if (!sortState.active || sortState.direction === '') {
          this.currentSort = '-workflow_id';
        } else {
          const prefix: string = sortState.direction === 'desc' ? '-' : '';
          this.currentSort = `${prefix}${sortState.active}`;
        }
        this.loadWorkflows();
      } else {
        this.dataSource.sort = this.sort;
      }
    });
  }

  loadWorkflows(): void {
    this.isLoading = true;

    // Call WorkflowService using 1-based page numbers for DRF
    this.workflowService
      .getWorkflows({
        page: this.pageIndex + 1,
        page_size: this.pageSize,
        days: 360,
        ordering: this.currentSort,
      })
      .subscribe({
        next: (response): void => {
          this.dataSource.data = response.results;
          this.totalCount = response.count;
          this.isLoading = false;
          this.log.debug(`Loaded ${this.totalCount} workflows`);
        },
        error: (err: unknown): void => {
          this.log.error('Failed to load workflows', err);
          this.isLoading = false;
        },
      });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadWorkflows();
  }

  // Row click navigates to child route /workflows/:id
  onRowClick(workflow: WorkflowItem): void {
    this.router.navigate([workflow.workflow_id], { relativeTo: this.route });
  }

  // Closing drawer navigates back to base route /workflows
  closeDetails(): void {
    this.router.navigate(['/workflows']);
  }

  onDrawerClosed(): void {
    this.closeDetails();
  }

  getStepStatusCounts(row: WorkflowItem): StatusCount[] {
    if (!row.total_steps) return [];
    return [
      { status: 'pending', count: row.pending_steps },
      { status: 'active', count: row.active_steps },
      { status: 'done', count: row.completed_steps },
      { status: 'failed', count: row.failed_steps },
    ];
  }

  getSegmentWidth(count: number, total: number): number {
    return total > 0 ? (count / total) * 100 : 0;
  }

  getProgressPercentage(row: WorkflowItem): number {
    if (!row.total_steps) return 0;
    const progress: number = ((row.completed_steps + row.active_steps * 0.5) / row.total_steps) * 100;
    return Math.round(progress);
  }
}
