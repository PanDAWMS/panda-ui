import { Component, computed, effect, input, InputSignal, viewChild } from '@angular/core';
import { DatasetItem } from '../../dataset.model';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { BreakAtPipe } from '../../../../shared/pipes/breakAt.pipe';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProgressBarSegmentedComponent } from '../../../../shared/components/progress-bar-segmented/progress-bar-segmented.component';
import { StatusCount } from '../../../../shared/models/status.model';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { MatCard, MatCardContent, MatCardHeader, MatCardModule, MatCardTitle } from '@angular/material/card';

@Component({
  selector: 'app-dataset-list',
  imports: [
    CommonModule,
    BreakAtPipe,
    DatePipe,
    MatPaginator,
    RouterLink,
    ProgressBarSegmentedComponent,
    MatTableModule,
    MatSortModule,
    BadgeComponent,
    MatCardModule,
  ],
  templateUrl: './dataset-list.component.html',
  styleUrl: './dataset-list.component.scss',
})
export class DatasetListComponent {
  readonly datasets: InputSignal<DatasetItem[] | null> = input<DatasetItem[] | null>(null);
  readonly isTask: InputSignal<boolean> = input<boolean>(false);

  readonly sort = viewChild(MatSort);
  readonly paginator = viewChild(MatPaginator);

  dataSource = new MatTableDataSource<DatasetItem>([]);
  readonly displayedColumns = computed(() => [
    'dataset',
    'type',
    'status',
    'files',
    'events',
    'created',
    ...(!this.isTask() ? ['task'] : []),
  ]);

  constructor() {
    effect(() => {
      const data = this.datasets();
      this.dataSource.data = data ?? [];
    });

    effect(() => {
      const sort = this.sort();
      const paginator = this.paginator();
      if (sort) {
        this.dataSource.sort = sort;
      }
      if (paginator) {
        this.dataSource.paginator = paginator;
      }
    });

    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'creationtime':
          return new Date(item.creationtime).getTime();
        case 'type': {
          const typeOrder: Record<string, number> = {
            input: 1,
            pseudo_input: 2,
            output: 3,
            lib: 4,
            log: 5,
          };
          return typeOrder[item.type] ?? 99;
        }
        default:
          return (item as any)[property] ?? '';
      }
    };
  }

  getFileCounts(row: DatasetItem): StatusCount[] {
    if (row.type === 'input' || row.type === 'pseudo_input') {
      return [
        { status: 'finished', count: row.nfilesfinished ?? 0 },
        { status: 'failed', count: row.nfilesfailed ?? 0 },
        {
          status: 'ready',
          count: (row.nfiles ?? 0) - (row.nfilesfinished ?? 0) - (row.nfilesfailed ?? 0),
        },
      ];
    } else if (row.type === 'output' || row.type === 'log') {
      return [{ status: 'registered', count: row.nfiles ?? 0 }];
    } else {
      return [];
    }
  }

  getEventCounts(row: DatasetItem): StatusCount[] {
    if (row.type === 'input' || row.type === 'pseudo_input') {
      return [
        { status: 'finished', count: row.neventsused ?? 0 },
        { status: 'ready', count: row.neventstobeused ?? 0 },
      ];
    }
    return [];
  }
}
