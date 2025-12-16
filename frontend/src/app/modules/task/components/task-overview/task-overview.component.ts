import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TaskParamsListComponent } from '../task-params-list/task-params-list.component';

@Component({
  selector: 'app-task-overview',
  imports: [TaskParamsListComponent],
  templateUrl: './task-overview.component.html',
  styleUrl: './task-overview.component.scss',
})
export class TaskOverviewComponent implements OnInit {
  private route = inject(ActivatedRoute);

  jeditaskid!: number;

  ngOnInit(): void {
    this.jeditaskid = +this.route.snapshot.paramMap.get('jeditaskid')!;
  }
}
