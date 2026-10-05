import { Component, inject, input, InputSignal } from '@angular/core';
import { WorkflowDetailsPanelComponent } from '../workflow-details-panel/workflow-details-panel.component';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-workflow-overview',
  imports: [CommonModule, WorkflowDetailsPanelComponent],
  templateUrl: './workflow-overview.component.html',
  styleUrl: './workflow-overview.component.scss',
})
export class WorkflowOverviewComponent {
  private router = inject(Router);

  id: InputSignal<string> = input.required<string>();
}
