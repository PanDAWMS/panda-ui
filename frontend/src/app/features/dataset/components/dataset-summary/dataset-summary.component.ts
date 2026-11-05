import { Component, computed, input, InputSignal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { DatasetItem, InputGroup, InputSummary, OutputGroup } from '../../dataset.model';
import { ProgressBarSegmentedComponent } from '../../../../shared/components/progress-bar-segmented/progress-bar-segmented.component';
import { BreakAtPipe } from '../../../../shared/pipes/breakAt.pipe';

@Component({
  selector: 'app-dataset-summary',
  imports: [DecimalPipe, ProgressBarSegmentedComponent, MatCardModule, BreakAtPipe],
  templateUrl: './dataset-summary.component.html',
  styleUrl: './dataset-summary.component.scss',
})
export class DatasetSummaryComponent {
  readonly datasets: InputSignal<DatasetItem[]> = input<DatasetItem[]>([]);
  readonly isTask: InputSignal<boolean> = input<boolean>(false);
  private readonly inputTypes = ['input', 'pseudo_input'];

  private readonly outputTypes = ['output'];

  // Secondary inputs are excluded
  private readonly primaryInputs = computed(() =>
    this.datasets().filter((d) => this.inputTypes.includes(d.type) && d.masterid === null),
  );

  private readonly outputs = computed(() => this.datasets().filter((d) => this.outputTypes.includes(d.type)));

  readonly inputGroups = computed<InputGroup[]>(() => {
    const datasets = this.primaryInputs();
    const groups = this.groupByContainer(datasets);

    if (groups.size === 0) {
      return [
        {
          name: null,
          summary: this.getInputSummary(datasets),
        },
      ];
    }

    return Array.from(groups, ([name, items]) => ({
      name,
      summary: this.getInputSummary(items),
    }));
  });

  readonly outputGroups = computed<OutputGroup[]>(() => {
    const datasets = this.outputs();
    const groups = this.groupByContainer(datasets);

    if (groups.size === 0) {
      return [
        {
          name: null,
          ...this.getOutputSummary(datasets),
        },
      ];
    }

    return Array.from(groups, ([name, items]) => ({
      name,
      ...this.getOutputSummary(items),
    }));
  });

  private groupByContainer(datasets: DatasetItem[]) {
    const groups = new Map<string, DatasetItem[]>();

    for (const dataset of datasets) {
      let name = dataset.containername?.trim();

      if (!name) {
        name = dataset.datasetname?.trim();
      }

      if (!name) continue;

      const group = groups.get(name) ?? [];
      group.push(dataset);
      groups.set(name, group);
    }

    return groups;
  }

  private getInputSummary(datasets: DatasetItem[]): InputSummary {
    const total = datasets.reduce((sum, d) => sum + (d.nfiles ?? 0), 0);
    const finished = datasets.reduce((sum, d) => sum + (d.nfilesfinished ?? 0), 0);
    const failed = datasets.reduce((sum, d) => sum + (d.nfilesfailed ?? 0), 0);

    return {
      counts: [
        { status: 'finished', count: finished },
        { status: 'failed', count: failed },
        { status: 'ready', count: Math.max(0, total - finished - failed) },
      ],
      total: total,
      progress: total > 0 ? (finished / total) * 100 : 0,
    };
  }

  private getOutputSummary(datasets: DatasetItem[]) {
    return {
      datasets: datasets.length,
      files: datasets.reduce((sum, d) => sum + (d.nfiles ?? 0), 0),
    };
  }
}
