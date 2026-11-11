import { Component, computed, input, InputSignal, Signal, signal, WritableSignal } from '@angular/core';
import { TaskItemDetail, TaskDetailSection, TaskDetailField } from '../../task.model';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { DetailFieldComponent } from '../../../../shared/components/detail-field/detail-field.component';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDivider } from '@angular/material/list';
import { SPLIT_RULE_DEFINITIONS } from '../../task-split-rule-definitions';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-task-params-list',
  imports: [
    CommonModule,
    MatCardModule,
    MatExpansionModule,
    MatTableModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    DetailFieldComponent,
    MatDivider,
  ],
  templateUrl: './task-params-list.component.html',
  styleUrl: './task-params-list.component.scss',
})
export class TaskParamsListComponent {
  readonly task: InputSignal<TaskItemDetail | null> = input<TaskItemDetail | null>(null);
  readonly search: WritableSignal<string> = signal('');
  readonly String = String;
  readonly sections: Signal<TaskDetailSection[]> = computed<TaskDetailSection[]>(() => {
    const d: TaskItemDetail | null = this.task();
    if (!d) return [];
    return [
      {
        title: 'Overview',
        fields: [
          { key: 'jeditaskid', label: 'Task ID', value: d.jeditaskid, class: 'font-mono' },
          { key: 'tasktype', label: 'Task type', value: d.tasktype },
          { key: 'status', label: 'Status', value: d.status, class: 'status-' + d.status?.toLowerCase() },
          {
            key: 'superstatus',
            label: 'Super status',
            value: d.superstatus,
            class: 'status-' + d.superstatus?.toLowerCase(),
          },
          { key: 'username', label: 'Username', value: d.username },
          { key: 'reqid', label: 'Request ID', value: d.reqid, class: 'font-mono' },
          { key: 'parent_tid', label: 'Parent Task ID', value: d.parent_tid, class: 'font-mono' },
          { key: 'taskname', label: 'Task name', value: d.taskname },
          { key: 'prodsourcelabel', label: 'Processing source label', value: d.prodsourcelabel },
          { key: 'processingtype', label: 'Processing type', value: d.processingtype },
          { key: 'workinggroup', label: 'Working group', value: d.workinggroup },
          { key: 'vo', label: 'VO', value: d.vo },
        ],
      },
      {
        title: 'Configuration',
        fields: [
          { key: 'campaign', label: 'Campaign', value: d.campaign },
          // { key: 'requesttype', label: 'Request type', value: d.requesttype },
          { key: 'splitrule', label: 'Split rule', value: d.splitrule },
          { key: 'termcondition', label: 'Term condition', value: d.termcondition },
          // { key: 'errordialog', label: 'Error dialog', value: d.errordialog },
          { key: 'eventservice', label: 'Event service', value: d.eventservice },
          { key: 'usejumbo', label: 'Use jumbo', value: d.usejumbo },
        ],
      },
      {
        title: 'Software & environment',
        fields: [
          { key: 'framework', label: 'Framework', value: d.framework },
          { key: 'container_name', label: 'Container name', value: d.container_name },
          { key: 'architecture', label: 'Architecture', value: this.formatArchitecture(d.architecture) },
          { key: 'transuses', label: 'Transformation uses', value: d.transuses },
          { key: 'transhome', label: 'Transformation home', value: d.transhome },
          { key: 'transpath', label: 'Transformation path', value: this.formatTransformationPath(d.transpath) },
        ],
      },
      {
        title: 'Scheduling',
        fields: [
          { key: 'gshare', label: 'Gshare', value: d.gshare },
          { key: 'resourcetype', label: 'Resource type', value: d.resourcetype },
          { key: 'currentpriority', label: 'Current priority', value: d.currentpriority },
          { key: 'taskpriority', label: 'Task priority', value: d.taskpriority },
          { key: 'attemptnr', label: 'Attempt number', value: d.attemptnr },
          { key: 'site', label: 'Site', value: d.site },
          { key: 'nucleus', label: 'Nucleus', value: d.nucleus },
          { key: 'lockedby', label: 'Locked by', value: d.lockedby },
        ],
      },
      {
        title: 'Resources',
        fields: [
          { key: 'corecount', label: 'Core count', value: d.corecount },
          { key: 'walltime', label: 'Walltime', value: `${d.walltime} ${d.walltimeunit}` },
          { key: 'basewalltime', label: 'Base walltime', value: `${d.basewalltime} s` },
          { key: 'cputime', label: 'CPU time', value: d.cputime ? `${d.cputime} ${d.cputimeunit}` : '---' },
          { key: 'cpuefficiency', label: 'CPU efficiency', value: `${d.cpuefficiency}%` },
          { key: 'ramcount', label: 'RAM count', value: `${d.ramcount} ${d.ramunit}` },
          { key: 'outdiskcount', label: 'Out disk count', value: `${d.outdiskcount} ${d.outdiskunit}` },
          { key: 'workdiskcount', label: 'Work disk count', value: `${d.workdiskcount} ${d.workdiskunit}` },
          {
            key: 'iointensity',
            label: 'I/O intensity',
            value: d.iointensity ? `${d.iointensity} ${d.iointensityunit}` : '---',
          },
          { key: 'diskio', label: 'Disk I/O', value: d.diskio ? `${d.diskio} ${d.diskiounit}` : '---' },
          { key: 'memoryleakcore', label: 'Memory leak core', value: d.memoryleakcore },
          { key: 'memoryleakx2', label: 'Memory leak x2', value: d.memoryleakx2 },
        ],
      },
      {
        title: 'Definition',
        fields: this.formatParamsJson(d.params_json),
      },
      {
        title: 'Split rule details',
        fields: this.formatSplitRule(d.splitrule),
      },
      {
        title: 'Timestamps',
        fields: [
          { key: 'creationdate', label: 'Creation date', value: d.creationdate },
          { key: 'starttime', label: 'Start time', value: d.starttime },
          { key: 'endtime', label: 'End time', value: d.endtime },
          { key: 'frozentime', label: 'Frozen time', value: d.frozentime },
          { key: 'statechangetime', label: 'State change time', value: d.statechangetime },
          { key: 'resquetime', label: 'Resque time', value: d.resquetime },
          { key: 'modificationtime', label: 'Modification time', value: d.modificationtime },
          { key: 'lockedtime', label: 'Locked time', value: d.lockedtime },
        ],
      },
    ];
  });

  readonly filteredSections = computed(() => {
    const query = this.search().trim().toLowerCase();

    if (!query) return this.sections();

    return this.sections()
      .map((section) => ({
        ...section,
        fields: section.fields.filter(
          (field) =>
            field.label.toLowerCase().includes(query) ||
            String(field.key).toLowerCase().includes(query) ||
            String(field.value ?? '')
              .toLowerCase()
              .includes(query),
        ),
      }))
      .filter((section) => section.fields.length > 0);
  });

  formatArchitecture(value: unknown): string {
    if (typeof value !== 'string' || !value.trim()) return '—';

    try {
      const arch = JSON.parse(value);

      const cpuSpecs = (arch.cpu_specs ?? [])
        .map((cpu: { arch?: string; instr?: string }) =>
          [cpu.arch, cpu.instr ? `(${cpu.instr})` : null].filter(Boolean).join(' '),
        )
        .filter(Boolean);

      const details = [
        arch.base_platform ? `Base: ${arch.base_platform}` : null,
        cpuSpecs.length ? `CPU: ${cpuSpecs.join(', ')}` : null,
        arch.gpu_spec ? `GPU: ${[arch.gpu_spec.vendor, arch.gpu_spec.version].filter(Boolean).join(' ')}` : null,
      ].filter(Boolean);

      return [arch.sw_platform, ...details].filter(Boolean).join(' · ') || '—';
    } catch {
      return value;
    }
  }

  formatTransformationPath(value: unknown): string {
    if (typeof value !== 'string' || !value.trim()) return '-';
    try {
      const url = new URL(value.trim());
      return decodeURIComponent(url.pathname.split('/').filter(Boolean).pop() ?? value);
    } catch {
      return value;
    }
  }

  private formatParamsJson(params_json: Record<string, unknown> | null): TaskDetailField[] {
    if (!params_json) return [];

    return Object.entries(params_json).map(([key, value]) => {
      const isStructured = (value !== null && typeof value === 'object') || key === 'cliParams';

      return {
        key: key as keyof TaskItemDetail,
        label: this.formatParamLabel(key),
        value: this.formatParamValue(value),
        ...(isStructured ? { class: 'font-mono whitespace-pre-wrap' } : {}),
      };
    });
  }

  private formatParamLabel(key: string): string {
    return key.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/^./, (char) => char.toUpperCase());
  }

  private formatParamValue(value: unknown): string {
    if (value === null || value === undefined) return '—';

    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }

    return String(value);
  }

  private formatSplitRule(value: unknown): TaskDetailField[] {
    if (typeof value !== 'string' || !value.trim()) return [];

    return value
      .split(',')
      .map((part): TaskDetailField | null => {
        const separatorIndex = part.indexOf('=');
        if (separatorIndex === -1) return null;

        const code = part.slice(0, separatorIndex).trim().toUpperCase();
        const paramValue = part.slice(separatorIndex + 1).trim();

        if (!code) return null;

        const definition = SPLIT_RULE_DEFINITIONS[code];

        return {
          key: `splitrule_${code}` as keyof TaskItemDetail,
          label: definition ? `${code} - ${definition.parameter}` : `${code} - Unknown parameter`,
          value: paramValue || '—',
          ...(definition ? { tooltip: definition.description } : {}),
        };
      })
      .filter((field) => field !== null);
  }
}
