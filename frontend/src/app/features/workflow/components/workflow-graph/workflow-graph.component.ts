import { Component, computed, effect, inject, input } from '@angular/core';
import { Node, Edge, GraphComponent, LayoutService, NgxGraphZoomOptions } from '@swimlane/ngx-graph';
import { StepDetail } from '../../workflow.model';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { LoggingService } from '../../../../core/services/logging.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-workflow-graph',
  imports: [CommonModule, GraphComponent, MatCardModule, MatChipsModule, MatTooltipModule],
  providers: [LayoutService],
  templateUrl: './workflow-graph.component.html',
  styleUrls: ['./workflow-graph.component.scss'],
})
export class WorkflowGraphComponent {
  private log = inject(LoggingService).forContext('WorkflowGraphComponent');
  private router = inject(Router);
  steps = input<StepDetail[]>([]);

  zoomToFit$: Subject<NgxGraphZoomOptions> = new Subject<NgxGraphZoomOptions>();
  center$: Subject<boolean> = new Subject<boolean>();

  constructor() {
    // Automatically re-center whenever steps change or load initially
    effect(() => {
      if (this.steps().length > 0) {
        this.refreshGraphLayout();
      }
    });
  }

  // derive nodes and edges from steps definition
  nodes = computed<Node[]>(() => {
    return this.steps().map((step) => {
      const def = step.definition_json;
      const status = (step.status || 'neutral').toLowerCase();
      return {
        id: def.id.toString(),
        label: `${def.name}`,
        data: {
          type: def.type,
          status: status,
          inputs: def.inputs,
          outputs: def.outputs,
          task_id: def.type === 'task' ? step.target_id : null,
          dynamicColor: `var(--status-${status}-color)`,
        },
      };
    });
  });

  edges = computed<Edge[]>(() => {
    const stepsList = this.steps();

    return stepsList.flatMap(({ definition_json: target }) => {
      if (!target.parents?.length) return [];

      return target.parents.map((parentId) => {
        // find the parent step definition
        const parent = stepsList.find((s) => s.definition_json.id === parentId)?.definition_json;

        // find the input matching the parent's member_id for label and take only part after /
        const matchedInput = Object.values(target.inputs || {}).find(
          (inp: any) => inp?.parent_id === parent?.member_id,
        ) as any;
        const rawLabel = matchedInput?.source || parent?.name || '';
        const label = rawLabel.includes('/') ? rawLabel.split('/')[1] : rawLabel;

        return {
          id: `e_${parentId}_${target.id}`,
          source: parentId.toString(),
          target: target.id.toString(),
          label: label,
        };
      });
    });
  });

  getNodeTooltipText(node: Node): string {
    if (!node || !node.data) return '';

    const data = node.data;

    return `
    Step #${node.id}
    Type: ${data.type || '-'} #${node.data.task_id || '-'}
    Status: ${data.status || '-'}
  `.trim();
  }

  onNodeClick(node: Node): void {
    if (node.data?.type === 'task' && node.data.task_id) {
      // Navigate to task page
      this.router.navigate(['/task/', node.data.task_id], {
        queryParams: { returnToWorkflow: 'true' },
      });
    }
  }

  public refreshGraphLayout(): void {
    // Wait for Material Drawer slide-in transition to complete
    setTimeout(() => {
      this.zoomToFit$.next({ force: true, autoCenter: true });
      this.center$.next(true);
    }, 300);
  }
}
