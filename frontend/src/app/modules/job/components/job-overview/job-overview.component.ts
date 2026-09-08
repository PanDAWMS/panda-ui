import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { JobParamsListComponent } from '../job-params-list/job-params-list.component';
import { ActivatedRoute } from '@angular/router';
import { DocsService } from '../../../aide/components/docs/docs.service';
import { PageContext } from '../../../../core/models/page-context';

const DOCS_JOB: PageContext = {
  pageTitle: 'Job Overview',
  topics: [
    {
      id: 'job-definition',
      title: 'Job Definition',
      content:
        "A job is an execution unit of workload sent to a computing site to process a subset of a task's input files. " +
        'While a task defines the overall scientific objective, it is broken down into individual jobs for distributed execution. ' +
        'A job consumes input data, executes the application code, and produces output data or log files. ' +
        'Each job is assigned a unique identifier PanDAID in the system.',
    },
    {
      id: 'job-status',
      title: 'Job Status',
      content: 'TBF',
    },
  ],
};

@Component({
  selector: 'app-job-overview',
  imports: [JobParamsListComponent],
  templateUrl: './job-overview.component.html',
  styleUrl: './job-overview.component.scss',
})
export class JobOverviewComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private docsService = inject(DocsService);

  pandaid!: number;

  ngOnInit(): void {
    this.pandaid = +this.route.snapshot.paramMap.get('pandaid')!;
    this.docsService.setPageContext(DOCS_JOB);
  }

  ngOnDestroy(): void {
    // Clear context when leaving the route
    this.docsService.setPageContext(null);
  }

  openDocs(topic_id: string): void {
    this.docsService.openDocs(topic_id);
  }
}
