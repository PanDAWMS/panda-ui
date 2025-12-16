import { Component, computed, inject, input, InputSignal, Signal } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { Task } from '../../../../core/models/task.model';
import { TaskService } from '../../../../core/services/task.service';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-task-params-list',
  imports: [CardModule, CommonModule, TableModule],
  templateUrl: './task-params-list.component.html',
  styleUrl: './task-params-list.component.scss',
})
export class TaskParamsListComponent {
  readonly jeditaskid: InputSignal<number | undefined> = input<number | undefined>();
  private taskService = inject(TaskService);
  private readonly taskId$ = toObservable(this.jeditaskid);
  // Auto-fetch the task whenever jeditaskid changes
  readonly taskInfo: Signal<Task | null> = toSignal(
    this.taskId$.pipe(switchMap((id) => (id ? this.taskService.getTask(id) : of(null)))),
    { initialValue: null },
  );

  toKeyValueList(task: Task): { key: string; value: any }[] {
    return Object.entries(task)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => ({ key, value }));
  }
}
