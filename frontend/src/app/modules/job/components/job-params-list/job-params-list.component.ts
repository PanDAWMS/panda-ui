import { Component, inject, input, InputSignal, Signal } from '@angular/core';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { MatCell, MatCellDef, MatColumnDef, MatRow, MatRowDef, MatTable } from '@angular/material/table';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { of, switchMap } from 'rxjs';
import { JobService } from '../../job.service';
import { Job } from '../../job.model';

@Component({
  selector: 'app-job-params-list',
  imports: [
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatRow,
    MatRowDef,
    MatTable,
  ],
  templateUrl: './job-params-list.component.html',
  styleUrl: './job-params-list.component.scss',
})
export class JobParamsListComponent {
  readonly pandaid: InputSignal<number | undefined> = input<number | undefined>();
  private jobService = inject(JobService);
  private readonly jobId$ = toObservable(this.pandaid);
  // Auto-fetch the task whenever jeditaskid changes
  readonly jobDetail: Signal<Job | null> = toSignal(
    this.jobId$.pipe(switchMap((id) => (id ? this.jobService.getJob(id) : of(null)))),
    { initialValue: null },
  );

  toKeyValueList(job: Job): { key: string; value: any }[] {
    return Object.entries(job)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => ({ key, value }));
  }
}
