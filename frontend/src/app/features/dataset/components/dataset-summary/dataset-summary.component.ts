import { Component, computed, input, InputSignal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { DatasetGroup, DatasetItem, InputSummary, OutputSummary } from '../../dataset.model';
import { ProgressBarSegmentedComponent } from '../../../../shared/components/progress-bar-segmented/progress-bar-segmented.component';
import { BreakAtPipe } from '../../../../shared/pipes/breakAt.pipe';
import { PluralizePipe } from '../../../../shared/pipes/pluralize';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTreeModule } from '@angular/material/tree';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';

@Component({
  selector: 'app-dataset-summary',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTreeModule,
    BreakAtPipe,
    BadgeComponent,
    ProgressBarSegmentedComponent,
    PluralizePipe,
  ],
  templateUrl: './dataset-summary.component.html',
  styleUrl: './dataset-summary.component.scss',
})
export class DatasetSummaryComponent {
  readonly datasets: InputSignal<DatasetItem[]> = input<DatasetItem[]>([]);
  readonly isTask: InputSignal<boolean> = input<boolean>(false);
  readonly isInputContainer: InputSignal<boolean> = input<boolean>(false);
  private readonly inputTypes = ['input', 'pseudo_input'];

  private readonly outputTypes = ['output'];

  // Secondary inputs are excluded
  private readonly primaryInputs = computed(() =>
    this.datasets().filter((d) => this.inputTypes.includes(d.type) && d.masterid === null),
  );

  private readonly outputs = computed(() => this.datasets().filter((d) => this.outputTypes.includes(d.type)));

  private getInputSummary(datasets: DatasetItem[]): InputSummary {
    const total = datasets.reduce((sum, d) => sum + (d.nfiles ?? 0), 0);
    const finished = datasets.reduce((sum, d) => sum + (d.nfilesfinished ?? 0), 0);
    const failed = datasets.reduce((sum, d) => sum + (d.nfilesfailed ?? 0), 0);
    const uniqueContainers = new Set(datasets.map((d) => d.containername).filter(Boolean));

    return {
      counts: [
        { status: 'finished', count: finished },
        { status: 'failed', count: failed },
        { status: 'ready', count: Math.max(0, total - finished - failed) },
      ],
      files: total,
      progress: total > 0 ? (finished / total) * 100 : 0,
      datasets: datasets.length,
      containers: uniqueContainers.size,
    };
  }

  private getOutputSummary(datasets: DatasetItem[]) {
    const uniqueContainers = new Set(datasets.map((d) => d.containername).filter(Boolean));
    return {
      containers: uniqueContainers.size,
      datasets: datasets.length,
      files: datasets.reduce((sum, d) => sum + (d.nfiles ?? 0), 0),
    };
  }

  readonly inputTreeData = computed<DatasetGroup[]>(() => this.buildGroups(this.primaryInputs(), 'input'));
  readonly outputTreeData = computed<DatasetGroup[]>(() => this.buildGroups(this.outputs(), 'output'));

  hasChildren = (_: number, node: any) => node.type === 'collection' || (node.children && node.children.length > 0);
  readonly childrenAccessor = (node: DatasetGroup) => node.children;

  private buildGroups(datasets: DatasetItem[], mode: 'input' | 'output'): DatasetGroup[] {
    const getSummary = (items: DatasetItem[]): InputSummary | OutputSummary =>
      mode === 'input' ? this.getInputSummary(items) : this.getOutputSummary(items);

    let children: DatasetGroup[];

    if (this.isInputContainer()) {
      // Group datasets by container
      const groups = new Map<string, DatasetItem[]>();
      const standalone: DatasetItem[] = [];

      for (const dataset of datasets) {
        const container = this.normalizeName(dataset.containername);

        if (container) {
          const items = groups.get(container) ?? [];
          items.push(dataset);
          groups.set(container, items);
        } else {
          standalone.push(dataset);
        }
      }

      const containerGroups: DatasetGroup[] = Array.from(groups, ([name, items]) => ({
        name: `${name}`,
        type: 'container',
        children: items.map((dataset) => this.createDatasetNode(dataset, mode)),
        summary: getSummary(items),
      }));
      const standaloneGroups = standalone.map((dataset) => this.createDatasetNode(dataset, mode));
      children = [...containerGroups, ...standaloneGroups];
    } else {
      // No container level: datasets are direct children of Input
      children = datasets.map((dataset) => this.createDatasetNode(dataset, mode));
    }

    // Input root is always present
    return [
      {
        name: mode === 'input' ? 'Input' : 'Output',
        type: 'collection',
        children,
        summary: getSummary(datasets),
      },
    ];
  }

  private createDatasetNode(dataset: DatasetItem, mode: 'input' | 'output'): DatasetGroup {
    return {
      name: this.normalizeName(dataset.datasetname),
      type: 'dataset',
      children: [],
      summary: mode === 'input' ? this.getInputSummary([dataset]) : this.getOutputSummary([dataset]),
    };
  }

  private normalizeName(name: string | null | undefined): string {
    // cut campaign name from dataset separated by ':'
    if (!name) return '';
    const separatorIndex = name.indexOf(':');
    return separatorIndex === -1 ? name : name.substring(separatorIndex + 1).trim();
  }
}
