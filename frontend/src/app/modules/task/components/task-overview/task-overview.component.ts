import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TaskParamsListComponent } from '../task-params-list/task-params-list.component';
import { DocsService } from '../../../aide/components/docs/docs.service';
import { PageContext } from '../../../../core/models/page-context';

const DOCS_TASK: PageContext = {
  pageTitle: 'Task Overview',
  topics: [
    {
      id: 'task-definition',
      title: 'Task Definition',
      content:
        'A task is a unit of workload to accomplish an indivisible scientific objective. ' +
        'If an objective is done in multiple steps, each step is mapped to a task. A task takes input and produces output. ' +
        'The goal of the task is to process the input entirely. Generally, input and output are collections of data files, ' +
        'but there are also other formats, such as a group of sequence numbers, metadata, notification, void, etc. ' +
        'Each task has a unique identifier JediTaskID in the system.',
    },
    {
      id: 'task-status',
      title: 'Task Status',
      content: 'TBF',
    },
  ],
};

@Component({
  selector: 'app-task-overview',
  imports: [TaskParamsListComponent],
  templateUrl: './task-overview.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './task-overview.component.scss',
})
export class TaskOverviewComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private docsService = inject(DocsService);

  jeditaskid!: number;

  ngOnInit(): void {
    this.jeditaskid = +this.route.snapshot.paramMap.get('jeditaskid')!;
    this.docsService.setPageContext(DOCS_TASK);
  }

  ngOnDestroy(): void {
    // Clear context when leaving the route
    this.docsService.setPageContext(null);
  }

  openDocs(topic_id: string): void {
    this.docsService.openDocs(topic_id);
  }
}
