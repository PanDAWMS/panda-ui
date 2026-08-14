import { Component, inject, input, InputSignal, Signal } from '@angular/core';
import { of, switchMap } from 'rxjs';
import { Task } from '../../task.model';
import { TaskService } from '../../task.service';
import { CommonModule } from '@angular/common';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-task-params-list',
  imports: [CommonModule, MatCardModule, MatTableModule],
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
