import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { LoggingService } from '../../../../core/services/logging.service';
import { DurationPipe } from '../../../../shared/pipes/duration.pipe';
import { WorkflowItem } from '../../workflow.model';
import { WorkflowService } from '../../workflow.service';
import { WorkflowDetailsPanelComponent } from '../workflow-details-panel/workflow-details-panel.component';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { ProgressBarSegmentedComponent } from '../../../../shared/components/progress-bar-segmented/progress-bar-segmented.component';
import { StatusCount } from '../../../../shared/models/status.model';

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
    WorkflowDetailsPanelComponent,
    BadgeComponent,
    ProgressBarSegmentedComponent,
  ],
  templateUrl: './workflow-list.component.html',
  styleUrls: ['./workflow-list.component.scss'],
})
export class WorkflowListComponent implements OnInit, AfterViewInit {
  private log = inject(LoggingService).forContext('WorkflowListComponent');
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private workflowService = inject(WorkflowService);

  protected readonly Math = Math;

  selectedWorkflow: WorkflowItem | null = null;
  displayedColumns: string[] = ['workflow', 'status', 'steps', 'progress', 'created', 'duration'];
  dataSource = new MatTableDataSource<WorkflowItem>();
  totalCount = 0;
  pageSize = 10;
  pageIndex = 0;
  isLoading = true;
  currentSort = '-workflow_id';
  isDrawerOpen = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('drawer') drawer!: MatDrawer;

  ngOnInit(): void {
    this.loadWorkflows();

    // Restore drawer state automatically when returning from Task page or on page load
    this.route.queryParams.subscribe((params) => {
      const workflowIdParam = params['workflow_id'];
      const isDrawerParamOpen = params['drawer'] === 'true';

      if (workflowIdParam && isDrawerParamOpen) {
        this.restoreDrawerState(workflowIdParam);
      } else if (!isDrawerParamOpen && this.selectedWorkflow) {
        this.selectedWorkflow = null;
        if (this.drawer?.opened) {
          this.drawer.close();
        }
      }
    });
  }

  ngAfterViewInit(): void {
    // sort on client side if just one page, if more - reload presorted data from server
    this.sort.sortChange.subscribe((sortState: Sort) => {
      const totalPages = Math.ceil(this.totalCount / this.pageSize);

      if (totalPages > 1) {
        this.pageIndex = 0; // reset to page 1 on sort change
        if (this.paginator) {
          this.paginator.pageIndex = 0;
        }
        // Convert MatSort direction ('asc'/'desc') to Django DRF query string format
        if (!sortState.active || sortState.direction === '') {
          this.currentSort = '-workflow_id';
        } else {
          const prefix = sortState.direction === 'desc' ? '-' : '';
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
        days: 30,
        ordering: this.currentSort,
      })
      .subscribe({
        next: (response) => {
          this.dataSource.data = response.results;
          this.totalCount = response.count;
          this.isLoading = false;
          this.log.debug(`Loaded ${this.totalCount} workflows`);

          // restoring selected workflow after data fetch if query params are present
          const workflowIdParam = this.route.snapshot.queryParams['workflow_id'];
          const isDrawerParamOpen = this.route.snapshot.queryParams['drawer'] === 'true';
          if (workflowIdParam && isDrawerParamOpen) {
            this.restoreDrawerState(workflowIdParam);
          }
        },
        error: (err) => {
          console.error('Failed to load workflows', err);
          this.isLoading = false;
        },
      });
  }

  private restoreDrawerState(workflowIdStr: string): void {
    this.log.debug(`workflowIdStr: ${workflowIdStr}`);
    if (!this.dataSource.data.length) return;
    this.log.debug(`${this.dataSource.data.toString()}`);
    const matchedWorkflow = this.dataSource.data.find(
      (item) => item.workflow_id.toString() === workflowIdStr.toString(),
    );

    if (matchedWorkflow) {
      this.selectedWorkflow = matchedWorkflow;
      this.isDrawerOpen = true;
      // Wait for ViewChild drawer initialization if needed
      setTimeout(() => this.drawer?.open());
    }
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadWorkflows();
  }

  // Row click opens drawer and updates URL params
  onRowClick(workflow: WorkflowItem): void {
    this.selectedWorkflow = workflow;
    this.isDrawerOpen = true;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { workflow_id: workflow.workflow_id, drawer: 'true' },
      queryParamsHandling: 'merge',
    });
  }

  // Closing drawer clears query params
  closeDetails(): void {
    this.isDrawerOpen = false;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        workflow_id: null,
        drawer: null,
      },
      queryParamsHandling: 'merge',
    });
  }

  protected onDrawerClosed(): void {
    this.selectedWorkflow = null;
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
    const progress = ((row.completed_steps + row.active_steps * 0.5) / row.total_steps) * 100;
    return Math.round(progress);
  }
}
