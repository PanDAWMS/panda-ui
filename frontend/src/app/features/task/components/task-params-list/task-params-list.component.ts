import { Component, computed, inject, input, InputSignal, Signal, signal, WritableSignal } from '@angular/core';
import { TaskItemDetail, TaskDetailSection } from '../../task.model';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { DetailFieldComponent } from '../../../../shared/components/detail-field/detail-field.component';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDivider } from '@angular/material/list';

@Component({
  selector: 'app-task-params-list',
  imports: [
    CommonModule,
    MatCardModule,
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
          { key: 'cputime', label: 'CPU time', value: `${d.cputime} ${d.cputimeunit}` },
          { key: 'cpuefficiency', label: 'CPU efficiency', value: `${d.cpuefficiency}%` },
          { key: 'ramcount', label: 'RAM count', value: `${d.ramcount} ${d.ramunit}` },
          { key: 'outdiskcount', label: 'Out disk count', value: `${d.outdiskcount} ${d.outdiskunit}` },
          { key: 'workdiskcount', label: 'Work disk count', value: `${d.workdiskcount} ${d.workdiskunit}` },
          { key: 'iointensity', label: 'I/O intensity', value: `${d.iointensity} ${d.iointensityunit}` },
          { key: 'diskio', label: 'Disk I/O', value: `${d.diskio} ${d.diskiounit}` },
          { key: 'memoryleakcore', label: 'Memory leak core', value: d.memoryleakcore },
          { key: 'memoryleakx2', label: 'Memory leak x2', value: d.memoryleakx2 },
        ],
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
}
