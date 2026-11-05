import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskListComponent } from '../../../task/components/task-list/task-list.component';

@Component({
  selector: 'app-user-overview',
  imports: [CommonModule, TaskListComponent],
  templateUrl: './user-overview.component.html',
  styleUrl: './user-overview.component.scss',
})
export class UserOverviewComponent {}
