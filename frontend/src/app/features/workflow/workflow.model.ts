import { PaginationQueryParams } from '../../shared/models/pagination.model';
import { MultiselectOption } from '../../shared/models/option.model';

export const PENDING_STATUSES = [
  'registered',
  'checking',
  'checked_true',
  'checked_false',
  'pending',
  'ready',
] as const;
export const ACTIVE_STATUSES = ['starting', 'running'] as const;
export const FAILED_STATUSES = ['failed', 'cancelled', 'closed'] as const;
export const WORKFLOW_STATUSES = [...PENDING_STATUSES, ...ACTIVE_STATUSES, ...FAILED_STATUSES];
export const WORKFLOW_STATUS_OPTIONS: MultiselectOption[] = WORKFLOW_STATUSES.map((status) => ({
  label: status,
  value: status,
}));

export interface WorkflowItem {
  workflow_id: number;
  name: string;
  status: string | null;
  creation_time: string;
  start_time: string | null;
  end_time: string | null;
  total_steps: number;
  pending_steps: number;
  active_steps: number;
  completed_steps: number;
  failed_steps: number;
}

export interface StepDetail {
  step_id: number;
  name: string | null;
  member_id: number;
  type: string | null;
  status: string | null;
  flavor: string | null;
  target_id: string | null;
  creation_time: string | null;
  start_time: string | null;
  end_time: string | null;
  modification_time: string | null;
  check_time: string | null;
  locked_by: string | null;
  lock_time: string | null;
  definition_json: StepDefinition;
  parameters: string | null;
}

export interface StepDefinition {
  id: number;
  member_id: number;
  name: string;
  type: string;
  is_leaf: boolean;
  is_head: boolean;
  is_tail: boolean;
  parents: number[];
  inputs: Record<string, any>;
  outputs: Record<string, any>;
}

export interface DataDetail {
  data_id: number;
  name: string;
  status: string;
  type: string;
  creation_time: string;
  modification_time: string;
}

export interface WorkflowDetail extends WorkflowItem {
  description: string | null;
  modification_time: string;
  steps: StepDetail[];
  data_items: DataDetail[];
  file_summary?: {
    datasets_count: number;
    files_total: number;
    files_finished: number;
    files_failed: number;
    files_missing: number;
    files_waiting: number;
  };
  step_summary?: {
    total_steps: number;
    pending_steps: number;
    active_steps: number;
    completed_steps: number;
    failed_steps: number;
  };
}

export interface WorkflowQueryParams extends PaginationQueryParams {
  name?: string;
  status?: string;
  type?: string;
  creation_time?: string;
  start_time?: string | null;
  [key: string]: unknown;
}
